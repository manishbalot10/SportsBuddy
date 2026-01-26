# Leaflet Features Guide for SportsBuddy

## Currently Used Features ✅

1. **Basic Map** - MapContainer, TileLayer
2. **Markers** - Custom icons with sport emojis
3. **Marker Clustering** - react-leaflet-cluster
4. **Popups** - Player information on marker click
5. **Custom Controls** - My Location button, Zoom controls
6. **Viewport-based Data Fetching** - Efficient loading
7. **Map Events** - Click handlers, pan/zoom events

## Available But Not Fully Utilized 🔶

### 1. **Heatmap Layer** (Already Installed!)
You have `leaflet.heat` installed but not fully implemented. You can:
- Show player density hotspots
- Visualize sport popularity by location
- Create intensity maps based on player counts

**Example Usage:**
```typescript
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// In your component
const map = useMap();
const heatData = players.map(p => [p.latitude, p.longitude, 1]);
const heatLayer = L.heatLayer(heatData, {
  radius: 25,
  blur: 15,
  maxZoom: 17,
  gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
}).addTo(map);
```

### 2. **Circle Component** (Imported but unused)
You can use circles to:
- Show search radius around user location
- Display distance boundaries
- Create visual zones

**Example:**
```typescript
<Circle
  center={[userLat, userLng]}
  radius={filters.maxDistance * 1000} // Convert km to meters
  pathOptions={{ color: '#E17827', fillOpacity: 0.1 }}
/>
```

### 3. **Polygon/Polyline** (Not imported yet)
Useful for:
- Drawing custom areas/zones
- Route visualization
- Boundary marking

## Additional Leaflet Plugins to Consider 📦

### 1. **Leaflet.draw** - Drawing Tools
```bash
npm install leaflet-draw @types/leaflet-draw
```
**Use Cases:**
- Let users draw custom search areas
- Mark favorite locations
- Create custom zones

### 2. **Leaflet.markercluster** - Enhanced Clustering
You're using react-leaflet-cluster, but the core library offers:
- Spiderfy animation
- Custom cluster icons
- Zoom-to-bounds on cluster click

### 3. **Leaflet.fullscreen** - Fullscreen Mode
```bash
npm install leaflet-fullscreen
```
**Use Cases:**
- Better mobile experience
- Immersive map viewing

### 4. **Leaflet.measure** - Distance/Area Measurement
```bash
npm install leaflet-measure
```
**Use Cases:**
- Let users measure distances between players
- Calculate area coverage
- Show route distances

### 5. **Leaflet.control.layers** - Layer Switcher
Built-in Leaflet feature for:
- Switching between different tile layers (satellite, street, terrain)
- Toggling overlay layers (heatmap, markers, etc.)

**Example:**
```typescript
const baseMaps = {
  "Street": tileLayer1,
  "Satellite": tileLayer2,
  "Terrain": tileLayer3
};
const overlayMaps = {
  "Players": markerLayer,
  "Heatmap": heatLayer
};
L.control.layers(baseMaps, overlayMaps).addTo(map);
```

### 6. **Leaflet.routing** - Route Planning
```bash
npm install leaflet-routing-machine
```
**Use Cases:**
- Show routes to player locations
- Calculate travel time
- Navigation assistance

### 7. **Leaflet.geocoder** - Search Places
```bash
npm install leaflet-control-geocoder
```
**Use Cases:**
- Search for locations by name
- Address autocomplete
- Location search bar

### 8. **Leaflet.zoomhome** - Home Button
```bash
npm install leaflet-zoomhome
```
**Use Cases:**
- Quick return to user location
- Reset map view

## Built-in Leaflet Features Not Yet Used 🎯

### 1. **Rectangle/Polygon Drawing**
```typescript
import { Rectangle, Polygon } from 'react-leaflet';

<Rectangle
  bounds={[[lat1, lng1], [lat2, lng2]]}
  pathOptions={{ color: '#E17827', fillOpacity: 0.2 }}
/>
```

### 2. **Tooltip** (vs Popup)
Tooltips are lighter-weight than popups:
```typescript
<Marker position={[lat, lng]}>
  <Tooltip permanent={false} direction="top">
    Player Name
  </Tooltip>
</Marker>
```

### 3. **Layer Groups**
Organize markers by sport:
```typescript
const cricketLayer = L.layerGroup(cricketPlayers);
const footballLayer = L.layerGroup(footballPlayers);
// Toggle visibility per sport
```

### 4. **Bounds and Fit Bounds**
```typescript
const map = useMap();
const bounds = L.latLngBounds(players.map(p => [p.lat, p.lng]));
map.fitBounds(bounds, { padding: [50, 50] });
```

### 5. **Zoom to Marker**
```typescript
map.flyTo([lat, lng], 15, { duration: 1.5 });
```

### 6. **Custom Tile Layers**
Switch between providers:
- OpenStreetMap
- CartoDB (currently using)
- Mapbox
- Google Maps (requires API key)
- Esri
- Stamen

### 7. **Image Overlays**
```typescript
import { ImageOverlay } from 'react-leaflet';

<ImageOverlay
  url="/path/to/image.png"
  bounds={[[lat1, lng1], [lat2, lng2]]}
/>
```

### 8. **Video Overlays**
```typescript
import { VideoOverlay } from 'react-leaflet';
```

### 9. **SVG Overlays**
For custom graphics and shapes

## React-Leaflet Specific Features 🔥

### 1. **useMapEvents Hook** (You're using this!)
Great for:
- Keyboard shortcuts
- Custom gestures
- Advanced interactions

### 2. **useMap Hook** (You're using this!)
Access map instance for:
- Programmatic control
- Advanced operations
- Custom controls

### 3. **WMSTileLayer**
For GIS data:
```typescript
import { WMSTileLayer } from 'react-leaflet';
```

### 4. **GeoJSON Component**
```typescript
import { GeoJSON } from 'react-leaflet';

<GeoJSON data={geoJsonData} />
```

## Recommended Next Steps 🚀

### High Priority (Easy Wins)
1. **Implement Heatmap** - You already have the plugin!
2. **Add Circle for Search Radius** - Visual feedback for maxDistance filter
3. **Use Tooltips** - Faster than popups for quick info
4. **Layer Switcher** - Let users toggle between marker view and heatmap

### Medium Priority (Enhanced UX)
1. **Leaflet.draw** - Custom area selection
2. **Leaflet.geocoder** - Location search
3. **Fullscreen mode** - Better mobile experience
4. **Multiple tile layers** - Satellite/terrain options

### Advanced Features
1. **Route planning** - Show directions to players
2. **Measurement tools** - Distance/area calculator
3. **Custom drawing** - Let users mark areas
4. **GeoJSON import/export** - Save favorite locations

## Code Examples for Quick Implementation

### 1. Toggle Heatmap Layer
```typescript
const [showHeatmap, setShowHeatmap] = useState(false);
const map = useMap();

useEffect(() => {
  if (showHeatmap) {
    const heatData = players.map(p => [p.latitude, p.longitude, 1]);
    const heat = L.heatLayer(heatData, { radius: 25, blur: 15 });
    heat.addTo(map);
    return () => map.removeLayer(heat);
  }
}, [showHeatmap, players, map]);
```

### 2. Search Radius Circle
```typescript
{userLocation && (
  <Circle
    center={[userLocation.lat, userLocation.lng]}
    radius={filters.maxDistance * 1000}
    pathOptions={{
      color: '#E17827',
      fillColor: '#E17827',
      fillOpacity: 0.1,
      weight: 2
    }}
  />
)}
```

### 3. Layer Control
```typescript
const [baseLayer, setBaseLayer] = useState('voyager');

const tileLayers = {
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

<TileLayer url={tileLayers[baseLayer]} />
```

## Resources 📚

- [Leaflet Official Docs](https://leafletjs.com/)
- [React-Leaflet Docs](https://react-leaflet.js.org/)
- [Leaflet Plugins Directory](https://leafletjs.com/plugins.html)
- [React-Leaflet Examples](https://react-leaflet.js.org/docs/start-example/)

---

**Note:** Many of these features can be added incrementally without breaking existing functionality. Start with the "High Priority" items for quick improvements!
