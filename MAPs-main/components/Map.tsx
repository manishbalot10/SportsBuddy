import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Player } from '../types';
import { SPORTS_CONFIG, USER_LOCATION } from '../constants';
import { HeatmapLayer } from './HeatmapLayer';

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

// Custom hook to update map view when data drastically changes (optional, omitted for stability)
const SetViewOnClick = () => {
  const map = useMap();
  // We can add logic here to flyTo user location on load
  return null;
};

// Create custom icons dynamically
const createCustomIcon = (sport: string) => {
  const config = SPORTS_CONFIG[sport as keyof typeof SPORTS_CONFIG] || SPORTS_CONFIG['Cricket']; // Fallback
  const colorHex = config.colorHex;
  
  // Create a clean HTML marker: A colored circle with a white border
  const html = `
    <div style="
      background-color: ${colorHex};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
    </div>
  `;

  return L.divIcon({
    className: 'custom-marker',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12], // Center the icon
    popupAnchor: [0, -12],
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

        <SetViewOnClick />

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
            // Customizing cluster icon via CSS in global styles or here (omitted for simplicity, using default colorful clusters)
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