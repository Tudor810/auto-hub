import { Stack } from "expo-router";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import {lightTheme} from "../utils";
import {darkTheme} from "../utils";
import { useColorScheme } from "react-native";

export default function RootLayout() {

  const colorScheme = useColorScheme();
  const activeTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const MD3ActiveTheme = colorScheme === 'dark' ? MD3DarkTheme: MD3LightTheme;

  const combineTheme = {
    ...MD3ActiveTheme,
    ...activeTheme,
    colors: {
      ...MD3ActiveTheme.colors,
      ...activeTheme.colors,
    },
  }

  return <PaperProvider theme={combineTheme}>
      <Stack>
        <Stack.Screen name="index" options={{
          headerShown: false
        }}/>
        <Stack.Screen name="sign-up" options={{
          headerShown: false
        }}/>
      </Stack>
  </PaperProvider>
}