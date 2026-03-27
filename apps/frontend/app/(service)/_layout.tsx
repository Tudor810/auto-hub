import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper'; // Pulling directly from your global provider

export default function ServiceLayout() {
  const { user, isLoading } = useAuth();
  
  // Instantly grab the correct, active theme object from your PaperProvider
  const theme = useTheme<any>(); // Cast to 'any' or your specific Theme type if needed

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

  return (
    <Tabs
      screenOptions={{
        // Now it seamlessly reacts to your global state
        tabBarActiveTintColor: theme.colors.primary, 
        tabBarInactiveTintColor: theme.colors.text.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false, 
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Servicii',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}