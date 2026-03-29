// Map.web.tsx
import React from 'react';
import { Map } from 'pigeon-maps';
import type { MapMarkerProps } from 'react-native-maps';

// --- THE MAP WRAPPER ---
export default function MapView({ initialRegion, children }: any) {
  const center: [number, number] = initialRegion 
    ? [initialRegion.latitude, initialRegion.longitude] 
    : [46.770439, 23.591423];

  const mappedChildren = React.Children.map(children, (child) => {
    // 🚨 FIX: Add <any> to isValidElement so TS allows us to check for .coordinate
    if (React.isValidElement<any>(child) && child.props.coordinate) {
      return React.cloneElement(child, {
        anchor: [child.props.coordinate.latitude, child.props.coordinate.longitude],
      });
    }
    return child;
  });

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <Map defaultCenter={center} defaultZoom={13}>
        {mappedChildren}
      </Map>
    </div>
  );
}

// --- THE MARKER WRAPPER ---
export const Marker: React.FC<any> = ({ 
  left, // <--- Now natively injected by pigeon-maps!
  top,  // <--- Now natively injected by pigeon-maps!
  onPress, 
  children 
}) => {
  // Failsafe: Prevent the marker from flashing at 0,0 before calculations finish
  if (typeof left !== 'number' || typeof top !== 'number') return null;

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation(); 
        if (onPress) onPress({} as any);
      }}
      style={{ 
        position: 'absolute',
        // We subtract 16 from left and top to perfectly center your 32x32px marker
        left: left - 16,
        top: top - 16,
        cursor: 'pointer',
        display: 'flex',
        width: '32px', 
        height: '32px',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        zIndex: 10 
      }}
    >
      {children}
    </div>
  );
};