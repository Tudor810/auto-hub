import { Tabs, Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper'; 
import { BusinessProvider } from '@/context/BusinessContext';

export default function ServiceLayout() {
  const { user, isLoading } = useAuth();
  const theme = useTheme<any>();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Security Guard
  if (user?.role !== 'provider') {
    return <Redirect href="/" />;
  }

  // NOUA STRUCTURĂ:
  // 1. BusinessProvider învelește tot, ca să avem datele peste tot
  // 2. Un Stack principal
  // 3. Tab-urile sunt puse într-un ecran invizibil din Stack (vezi name="index")
  // 4. Ecranul de editare este alt ecran din Stack, setat ca Modal

  return (
    <BusinessProvider>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* Grupul tău principal cu Tab-uri de jos (le-am redenumit logic "tabs" sau pot fi ignorate ca nume dacă le declari direct) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen name="add-location"  />
        
      </Stack>
    </BusinessProvider>
  );
}