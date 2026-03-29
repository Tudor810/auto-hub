// Map.tsx
// This file exists PURELY to keep TypeScript happy. 
// At runtime, the Expo bundler will ignore this and automatically 
// grab Map.native.tsx or Map.web.tsx instead!

import MapView, { Marker } from 'react-native-maps';

export { Marker };
export default MapView;