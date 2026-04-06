import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const theme = useTheme<any>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive logic for web/desktop
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 500 : '100%';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[
        styles.content, 
        { width: maxWidth },
        // Aici adăugăm stilul de card doar pentru desktop web
        isDesktop && {
          backgroundColor: theme.colors.surface,
          padding: 48,
          borderRadius: 24,
          ...Platform.select({ web: { boxShadow: '0px 4px 24px rgba(0,0,0,0.06)' } as any })
        }
      ]}>
        
        {/* Icon Container */}
        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
          <Ionicons name="compass-outline" size={64} color={theme.colors.primary || '#3B82F6'} />
        </View>

        {/* 404 Error Text */}
        <Text style={[styles.errorCode, { color: theme.colors.primary }]}>404</Text>
        
        {/* Title & Subtitle */}
        <Text style={[styles.title, { color: theme.colors.text.main }]}>
          Oops! Te-ai rătăcit.
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.muted }]}>
          Se pare că pagina pe care o cauți nu există, a fost mutată sau un mecanic a luat-o pentru piese.
        </Text>

        {/* Back Home Button */}
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]} 
          onPress={() => router.replace('/')} // Using replace so the broken URL doesn't stay in history
          activeOpacity={0.8}
        >
          <Ionicons name="home" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Înapoi Acasă</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' } as any
    })
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});