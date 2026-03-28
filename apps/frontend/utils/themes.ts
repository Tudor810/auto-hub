// constants/theme.ts
import { Platform, StyleProp, TextStyle } from 'react-native';

export const lightTheme = {
  colors: {
    // Backgrounds
    background: '#F3F4F6', // App body background
    surface: '#FFFFFF',    // Cards, inputs, white elements
    error: "#DC2626",
    errorBackground: "#FEF2F2",
    // Primary Brand Elements
    primary: '#2C477E',    // Navy/Black for main buttons & active states
    primaryText: '#FFFFFF',// White text on primary buttons

    // Typography
    text: {
      main: '#111827',       // Headings, active text, bold links
      secondary: '#374151',  // Input labels, secondary buttons
      muted: '#6B7280',      // Subtitles, standard footer text
      placeholder: '#9CA3AF',// Placeholders, inactive icons, divider text
      link: '#4B5563',       // Standard links
      error: "#B91C1C",      // Error messages
    },

    // Borders & Lines
    border: {
      light: '#E5E7EB',  // Dividers, google button border
      medium: '#D1D5DB', // Input field borders
      error: '#FCA5A5' // Error state borders
    },

    // Specific Element Colors
    logo: {
      background: '#F0F9FF',
      border: '#E0F2FE',
    }
  },

  // Standardized Spacing (helps keep margins/padding consistent)
  spacing: {
    xs: 8,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  // Standardized Radii
  borderRadius: {
    input: 8,
    button: 8,
    card: 16,
    round: 9999, // For circles like the logo placeholder
  },

  // Centralized Shadows
  shadows: {
    card: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.25)',
      } as any, // Cast to any for React Native Web types
    }),
  }
};

export const darkTheme = {
  colors: {
    // Backgrounds
    background: '#0F172A', // Deep slate for app body
    surface: '#1E293B',    // Slightly lighter slate for cards/inputs
    error: '#EF4444',      // Brighter red to pop against dark backgrounds
    errorBackground: '#450A0A', // Very dark red tint for error banners

    // Primary Brand Elements 
    primary: '#60A5FA',      // The new Electric Blue!
    primaryText: '#0F172A',  // Dark navy text so it's easy to read

    // Typography
    text: {
      main: '#F9FAFB',       // Off-white for headings to avoid harsh contrast
      secondary: '#D1D5DB',  // Light gray for input labels
      muted: '#9CA3AF',      // Medium gray for subtitles and footer text
      placeholder: '#6B7280',// Darker gray for placeholders
      link: '#E5E7EB',       // Light gray for standard links
      error: '#FCA5A5',      // Soft red for error text (easier to read on dark)
    },

    // Borders & Lines
    border: {
      light: '#334155',  // Dark dividers, google button border
      medium: '#475569', // Input field borders
      error: '#991B1B',  // Darker red for error state borders
    },

    // Specific Element Colors
    logo: {
      background: '#082F49', // Very deep sky blue
      border: '#0C4A6E',     // Deep sky blue border
    }
  },

  // Standardized Spacing (Identical to light theme)
  spacing: {
    xs: 8,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  // Standardized Radii (Identical to light theme)
  borderRadius: {
    input: 8,
    button: 8,
    card: 16,
    round: 9999,
  },

  // Centralized Shadows
  shadows: {
    card: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, // Increased opacity since shadows are harder to see on dark
        shadowRadius: 10,
      },
      android: {
        elevation: 4, // Slightly higher elevation for dark mode surfaces
      },
      web: {
        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.5)', // Darker, stronger shadow
      } as any,
    }),
  }
};

