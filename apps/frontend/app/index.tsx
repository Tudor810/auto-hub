import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.role) {
    return <Redirect href="/(auth)/select-role" />;
  }

  return user.role === 'provider' 
    ? <Redirect href="/(service)/profile" /> 
    : <Redirect href="/(client)/home" />;
}