import { Stack } from "expo-router";
import { MD3DarkTheme, MD3LightTheme, PaperProvider} from "react-native-paper";
import { lightTheme } from "../utils/themes";
import { darkTheme } from "../utils/themes";
import { Platform, useColorScheme } from "react-native";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StatusBar } from "expo-status-bar";
import * as SystemUi from 'expo-system-ui'
import { useEffect } from "react";

export default function RootLayout() {

  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const MD3ActiveTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  const combineTheme = {
    theme: colorScheme,
    ...MD3ActiveTheme,
    ...activeTheme,
    colors: {
      ...MD3ActiveTheme.colors,
      ...activeTheme.colors,
    },
  }
  useEffect(() => {
    SystemUi.setBackgroundColorAsync(activeTheme.colors.background);
  }, [activeTheme])
  
  if (Platform.OS === 'web') {
    return (
      <GoogleOAuthProvider clientId="64399865931-uv8ni2g23vbn427o2v6io528qkg67ovt.apps.googleusercontent.com">
        <PaperProvider theme={combineTheme}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />

          </AuthProvider>
        </PaperProvider>
      </GoogleOAuthProvider>
    )
  }

  return (
    <PaperProvider theme={combineTheme}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>)
}