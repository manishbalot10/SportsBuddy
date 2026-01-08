import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    // Simple circle-based heatmap visualization
    // For production, consider using leaflet.heat plugin
    const circles: L.Circle[] = [];
    
    points.forEach(([lat, lng, intensity]) => {
      const circle = L.circle([lat, lng], {
        radius: 500 + intensity * 200,
        fillColor: '#3b82f6',
        fillOpacity: Math.min(0.4, intensity * 0.1),
        stroke: false,
      }).addTo(map);
      circles.push(circle);
    });

    return () => {
      circles.forEach(c => c.remove());
    };
  }, [map, points]);

  return null;
};
