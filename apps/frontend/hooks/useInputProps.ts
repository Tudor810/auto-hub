import { StyleProp, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper'; // Grabs the active theme from the Provider

// Notice the "use" prefix. This makes it a hook!
export const useInputProps = (customStyle?: StyleProp<TextStyle>, hasError?: boolean) => {
  const theme = useTheme<any>(); // <any> or your custom Theme type

return {
    mode: "outlined" as const,
    style: [
      {
        // marginBottom: hasError ? 0 : theme.spacing.sm,
        fontSize: 15,
        height: 48,
      },
      customStyle,
    ],
    // 1. Swap the static outline color
    outlineColor: hasError ? theme.colors.error : theme.colors.border.medium,
    
    // 2. Swap the active (focused) outline color
    activeOutlineColor: hasError ? theme.colors.error : theme.colors.primary,
    
    placeholderTextColor: theme.colors.text.placeholder,
    theme: { 
      roundness: theme.borderRadius.input, 
      colors: { 
        background: theme.colors.surface,
        // 3. Swap the primary color so the cursor and floating label also turn red
        primary: hasError ? theme.colors.error : theme.colors.primary,
        onSurfaceVariant: theme.colors.text.placeholder,
        onSurface: theme.colors.text.main,
      } 
    }
  };
};