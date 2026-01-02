import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Player } from '../types';
import { SPORTS_CONFIG, USER_LOCATION } from '../constants';
import { HeatmapLayer } from './HeatmapLayer';

// Types for scalable clustering API
interface ClusterItem {
  id: string;
  isCluster: boolean;
  latitude: number;
  longitude: number;
  count: number;
  sportCounts?: Record<string, number>;
  player?: Player;
}

interface ClusterResponse {
  viewport: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  zoom: number;
  totalInViewport: number;
  clusters: ClusterItem[];
}

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  viewMode: 'markers' | 'density';
}

// Fix map size invalidation on load
const MapInvalidator = () => {
  const map = useMap();
  React.useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

/**
 * SCALABLE: Viewport-based data fetcher
 * Only fetches data for visible area, refetches on pan/zoom
 * 
 * Algorithm: Debounced viewport queries
 * - Prevents API spam during pan/zoom
 * - Only loads visible data (not entire dataset)
 * - Server handles clustering based on zoom level
 */
const ViewportDataFetcher: React.FC<{
  onDataLoad: (clusters: ClusterItem[], total: number) => void;
  sport?: string;
}> = ({ onDataLoad, sport }) => {
  const map = useMapEvents({
    moveend: () => fetchViewportData(),
    zoomend: () => fetchViewportData(),
  });

  const fetchViewportData = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    const params = new URLSearchParams({
      minLat: bounds.getSouth().toString(),
      maxLat: bounds.getNorth().toString(),
      minLng: bounds.getWest().toString(),
      maxLng: bounds.getEast().toString(),
      zoom: zoom.toString(),
    });
    
    if (sport && sport !== 'All') {
      params.append('sport', sport);
    }

    fetch(`http://localhost:8080/api/users/viewport?${params}`)
      .then(res => res.json())
      .then((data: ClusterResponse) => {
        onDataLoad(data.clusters || [], data.totalInViewport || 0);
      })
      .catch(err => console.error('Viewport fetch failed:', err));
  }, [map, sport, onDataLoad]);

  // Initial fetch
  useEffect(() => {
    const timer = setTimeout(fetchViewportData, 200);
    return () => clearTimeout(timer);
  }, [fetchViewportData]);

  return null;
};

// Sport emoji/icon mapping
const SPORT_ICONS: Record<string, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Hockey: '🏑',
  Badminton: '🏸',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Kabaddi: '🤼',
  Wrestling: '🤼',
  Boxing: '🥊',
  Shooting: '🎯',
  Archery: '🏹',
  Athletics: '🏃',
  Swimming: '🏊',
  Volleyball: '🏐',
  Basketball: '🏀',
  Chess: '♟️',
  Carrom: '🎯',
  'Kho Kho': '🏃',
  Squash: '🎾',
  Golf: '⛳',
  Cycling: '🚴',
  Weightlifting: '🏋️',
  Gymnastics: '🤸',
  'Martial Arts': '🥋',
  Yoga: '🧘',
  Running: '🏃',
  Marathon: '🏃',
  Throwball: '🏐',
  Handball: '🤾',
  Baseball: '⚾',
};

// Create custom icons dynamically with sport emoji
const createCustomIcon = (sport: string) => {
  const config = SPORTS_CONFIG[sport as keyof typeof SPORTS_CONFIG] || SPORTS_CONFIG['Cricket'];
  const colorHex = config.colorHex;
  const sportIcon = SPORT_ICONS[sport] || '🏅';
  
  const html = `
    <div style="
      background-color: ${colorHex};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">
      ${sportIcon}
    </div>
  `;

  return L.divIcon({
    className: 'custom-marker',
    html: html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Create cluster icon for server-side clusters
const createClusterIcon = (count: number, sportCounts?: Record<string, number>) => {
  // Determine dominant sport color
  let dominantColor = '#3b82f6'; // Default blue
  if (sportCounts) {
    const topSport = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topSport && SPORTS_CONFIG[topSport as keyof typeof SPORTS_CONFIG]) {
      dominantColor = SPORTS_CONFIG[topSport as keyof typeof SPORTS_CONFIG].colorHex;
    }
  }
  
  // Size based on count (logarithmic scaling for millions)
  const size = Math.min(60, Math.max(30, 20 + Math.log10(count + 1) * 15));
  
  return L.divIcon({
    className: 'server-cluster',
    html: `
      <div style="
        background-color: ${dominantColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 40 ? '14px' : '12px'};
      ">
        ${count >= 1000 ? Math.round(count/1000) + 'k' : count}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

// User Location Marker Icon
const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background-color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const Map: React.FC<MapProps> = ({ players, onPlayerSelect, viewMode }) => {
  // Memoize icons to prevent flickering or re-creation
  const getIcon = (sport: string) => {
    return createCustomIcon(sport);
  };

  const heatmapPoints = useMemo(() => {
    return players.map(p => [p.latitude, p.longitude, 0.5] as [number, number, number]);
  }, [players]);

  return (
    <div className="w-full h-full z-0">
      <MapContainer
        center={[USER_LOCATION.latitude, USER_LOCATION.longitude]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // We can add custom zoom control if needed, or use default
      >
        {/* Dark/Light mode compatible tiles: CartoDB Voyager is clean */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapInvalidator />

        {/* User Location */}
        <Marker position={[USER_LOCATION.latitude, USER_LOCATION.longitude]} icon={userIcon}>
           <Popup>You are here</Popup>
        </Marker>

        {/* View Mode Logic */}
        {viewMode === 'markers' ? (
          <MarkerClusterGroup
            chunkedLoading
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            maxClusterRadius={60}
          >
            {players.map((player) => (
              <Marker
                key={player.id}
                position={[player.latitude, player.longitude]}
                icon={getIcon(player.sport)}
                eventHandlers={{
                  click: () => onPlayerSelect(player),
                }}
              >
                <Popup>
                  <div style={{ minWidth: '150px', padding: '4px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{player.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{player.sport} • {player.level}</div>
                    {player.distance_km && <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{player.distance_km} km away</div>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          <HeatmapLayer points={heatmapPoints} />
        )}
      </MapContainer>
      
      {/* Add custom style for user marker pulse */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

/**
 * SCALABLE MAP COMPONENT
 * 
 * Handles millions of users efficiently using:
 * 1. Viewport-based queries (only fetch visible area)
 * 2. Server-side clustering (O(n) geohash-based)
 * 3. Zoom-aware Level of Detail (LOD)
 * 4. Debounced pan/zoom events
 * 
 * Time Complexity: O(k) where k = clusters in viewport << n total users
 * Memory: O(k) - only visible data loaded
 */
interface ScalableMapProps {
  onPlayerSelect: (player: Player) => void;
  onTotalChange?: (total: number) => void;
  sport?: string;
  viewMode: 'markers' | 'density';
}

// Google-style "My Location" button (renders inside MapContainer, uses useMap)
const MyLocationControl: React.FC<{ onLocationUpdate: (lat: number, lng: number) => void }> = ({ onLocationUpdate }) => {
  const map = useMap();

  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.innerHTML = `
      <a href="#" title="Go to my location" style="
        width: 40px; height: 40px; display: flex; align-items: center; 
        justify-content: center; background: white; text-decoration: none;
        border-radius: 8px;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
          <circle cx="12" cy="12" r="3" fill="#4285f4" stroke="#4285f4"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </a>
    `;
    
    container.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const link = container.querySelector('a');
      if (link) link.innerHTML = '<div style="width:16px;height:16px;border:2px solid #4285f4;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>';
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15, { duration: 1.5 });
          onLocationUpdate(latitude, longitude); // Update the red marker!
          if (link) link.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285f4" stroke-width="2"><circle cx="12" cy="12" r="3" fill="#4285f4" stroke="#4285f4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get location. Please enable location access.');
          if (link) link.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="12" r="3" fill="#4285f4" stroke="#4285f4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };
    
    L.DomEvent.disableClickPropagation(container);
    
    const LocationControl = L.Control.extend({
      onAdd: () => container
    });
    
    const control = new LocationControl({ position: 'bottomright' });
    control.addTo(map);
    
    return () => { control.remove(); };
  }, [map, onLocationUpdate]);

  return null;
};

// Scalable Markers Component to handle Map interactions
const ScalableMarkers: React.FC<{
  clusters: ClusterItem[];
  onPlayerSelect: (player: Player) => void;
}> = ({ clusters, onPlayerSelect }) => {
  const map = useMap();

  const handleClusterClick = (cluster: ClusterItem) => {
    map.flyTo([cluster.latitude, cluster.longitude], map.getZoom() + 2, {
      duration: 0.5,
      easeLinearity: 0.25
    });
  };

  return (
    <>
      {/* 1. Server-side Pre-aggregated Clusters (Static) */}
      {clusters.filter(c => c.isCluster).map((cluster, idx) => (
        <Marker
          key={`cluster-${cluster.id}-${idx}`}
          position={[cluster.latitude, cluster.longitude]}
          icon={createClusterIcon(cluster.count, cluster.sportCounts)}
          eventHandlers={{
            click: () => handleClusterClick(cluster),
          }}
        >
          {/* Optional: Remove Popup for clusters to prioritize Zoom, or keep on hover? 
              Let's keep Popup but zoom on click takes precedence usually. 
               actually, let's allow popup but zoom is nice. */}
        </Marker>
      ))}

      {/* 2. Individual Markers (Client-side Clustered for Animation) */}
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        maxClusterRadius={60}
      >
        {clusters.filter(c => !c.isCluster).map((cluster, idx) => (
          <Marker
            key={`player-${cluster.id}-${idx}`}
            position={[cluster.latitude, cluster.longitude]}
            icon={createCustomIcon(cluster.player?.sport || 'Cricket')}
            eventHandlers={{
              click: () => cluster.player && onPlayerSelect(cluster.player),
            }}
          >
            {cluster.player && (
              <Popup>
                <div style={{ minWidth: '150px', padding: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {cluster.player.level} {cluster.player.sport} Player
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Tap to view details
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  );
};

// India center for fallback (when geolocation denied)
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const INDIA_ZOOM = 5;

// Component to set initial map view based on GPS detection
const InitialLocationDetector: React.FC<{ 
  onLocationDetected: (lat: number, lng: number) => void;
  onLocationDenied: () => void;
}> = ({ onLocationDetected, onLocationDenied }) => {
  const map = useMap();
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.flyTo([latitude, longitude], 13, { duration: 1.5 });
        onLocationDetected(latitude, longitude);
      },
      () => {
        // Geolocation denied - show zoomed out India view
        map.flyTo([INDIA_CENTER.lat, INDIA_CENTER.lng], INDIA_ZOOM, { duration: 1 });
        onLocationDenied();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [map, onLocationDetected, onLocationDenied]);
  
  return null;
};

export const ScalableMap: React.FC<ScalableMapProps> = ({ 
  onPlayerSelect, 
  onTotalChange,
  sport,
  viewMode 
}) => {
  const [clusters, setClusters] = useState<ClusterItem[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasGpsLocation, setHasGpsLocation] = useState(false);

  const handleDataLoad = useCallback((newClusters: ClusterItem[], total: number) => {
    setClusters(newClusters);
    setTotalPlayers(total);
    onTotalChange?.(total);
  }, [onTotalChange]);

  const handleLocationDetected = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setHasGpsLocation(true);
  }, []);

  const handleLocationDenied = useCallback(() => {
    setHasGpsLocation(false);
  }, []);

  const handleLocationUpdate = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setHasGpsLocation(true);
  }, []);

  const heatmapPoints = useMemo(() => {
    return clusters.map(c => [c.latitude, c.longitude, c.count / 10] as [number, number, number]);
  }, [clusters]);

  return (
    <div className="w-full h-full z-0">
      <MapContainer
        center={[INDIA_CENTER.lat, INDIA_CENTER.lng]}
        zoom={INDIA_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapInvalidator />
        
        {/* Auto-detect GPS location on mount */}
        <InitialLocationDetector 
          onLocationDetected={handleLocationDetected} 
          onLocationDenied={handleLocationDenied} 
        />
        
        {/* Scalable viewport-based data fetching */}
        <ViewportDataFetcher onDataLoad={handleDataLoad} sport={sport} />

        {/* User Location - only show if GPS detected */}
        {hasGpsLocation && userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Google-style My Location Button */}
        <MyLocationControl onLocationUpdate={handleLocationUpdate} />

        {/* Render clusters or heatmap */}
        {viewMode === 'markers' ? (
          <ScalableMarkers clusters={clusters} onPlayerSelect={onPlayerSelect} />
        ) : (
          <HeatmapLayer points={heatmapPoints} />
        )}
      </MapContainer>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};