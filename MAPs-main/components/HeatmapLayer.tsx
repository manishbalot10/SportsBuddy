import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
}

export const HeatmapLayer = ({ points }: HeatmapLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heat = (L as any).heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.2: '#22c55e',
        0.4: '#eab308',
        0.6: '#f97316',
        0.8: '#ef4444',
        1.0: '#dc2626'
      }
    });

    heat.addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map]);

  return null;
};
