import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ClientLayout() {
  const { user, isLoading } = useAuth();

  // 1. Wait for auth to load
  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  // 2. Security Guard: If not a client, send back to dispatcher
  if (user?.role !== 'customer') {
    return <Redirect href="/" />;
  }

  return (
    
     <Stack screenOptions={{ headerShown: false }}>
        
        {/* Grupul tău principal cu Tab-uri de jos (le-am redenumit logic "tabs" sau pot fi ignorate ca nume dacă le declari direct) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* <Stack.Screen name="add-location"  /> */}
        
      </Stack>
  );
}