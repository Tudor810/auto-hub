import { Tabs, Redirect } from 'expo-router';
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
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2196F3' }}>
      <Tabs.Screen
        name="home"
        options={{ title: 'AutoHub', tabBarLabel: 'Home' }}
      />
      {/* <Tabs.Screen 
        name="my-cars" 
        options={{ title: 'Garage', tabBarLabel: 'My Cars' }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ title: 'Account', tabBarLabel: 'Profile' }} 
      /> */}
    </Tabs>
  );
}