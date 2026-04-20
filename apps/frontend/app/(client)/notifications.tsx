import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';
import ErrorMessage from '@/components/ErrorMessage';

export default function NotificationsScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {user, token} = useAuth();

  // --- Responsive Layout Logic ---
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // --- State for Toggles ---
  const [preferences, setPreferences] = useState({
    appointments: user?.notificationPreferences?.appointments ?? true,
    documents: user?.notificationPreferences?.documents ?? true,
    promotions: user?.notificationPreferences?.promotions ?? false,
    service: user?.notificationPreferences?.service ?? true,
  });

  const [error, setError] = useState('');

  // Toggle handler
const toggleSwitch = async (key: keyof typeof preferences) => {
    // 1. Calculate the new state
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    
    // 2. Optimistic UI update (feels instant to the user)
    setPreferences(newPreferences);

    try {
      // 3. Send the new preferences to the backend
      const response = await fetch(`${API_BASE_URL}/api/AUTH/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences: newPreferences })
      });

      if (!response.ok) {
        setError("Eroare la salvare preferințelor");
      }
      
      // Optional: You might want to call a function here to update the user 
      // object inside your AuthContext so it stays in sync across the app.

    } catch (error) {
      console.error("Error saving preference:", error);
      // 4. Revert the switch back if the API call failed
      setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
      setError("Eroare la salvare preferințelor");
    }
  };

  // --- Data Structure ---
  const notificationOptions = [
    {
      id: 'appointments',
      title: 'Programări',
      desc: 'Notificări despre confirmări și memento-uri',
      icon: 'calendar-outline',
      color: '#3B82F6', // Blue
      bg: theme.dark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF'
    },
    {
      id: 'documents',
      title: 'Documente',
      desc: 'Alerte pentru expirare ITP, RCA, Rovinietă',
      icon: 'shield-checkmark-outline',
      color: '#F59E0B', // Orange/Yellow
      bg: theme.dark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB'
    },
    {
      id: 'promotions',
      title: 'Promoții',
      desc: 'Oferte speciale de la parteneri',
      icon: 'notifications-outline',
      color: '#A855F7', // Purple
      bg: theme.dark ? 'rgba(168, 85, 247, 0.15)' : '#FAF5FF'
    },
    {
      id: 'service',
      title: 'Service',
      desc: 'Memento-uri pentru revizii și întreținere',
      icon: 'car-sport-outline',
      color: '#10B981', // Green
      bg: theme.dark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5'
    },
  ] as const;

  const navigation = useNavigation();
  
  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: isDesktop ? 40 : insets.top + 20, paddingBottom: 40 }
        ]}
      >
        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            padding: 40,
            borderRadius: 24,
            ...Platform.select({
              web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any,
              default: { elevation: 4 }
            }),
          }
        ]}>

          <TouchableOpacity
            style={[styles.backButton, !isDesktop && { paddingHorizontal: 20 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={28} color={theme.colors.text.main} />
          </TouchableOpacity>

          {/* HEADER SECTION */}
          <View style={[styles.headerRow, !isDesktop && { paddingHorizontal: 20 }]}>
            <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Notificări</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>
              Gestionează preferințele de notificare
            </Text>
          </View>

          {/* UNIFIED SETTINGS CARD */}
          <View style={[styles.listContainer, !isDesktop && { paddingHorizontal: 20 }]}>
            <View style={[
              styles.settingsCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border?.light || '#F3F4F6',
              }
            ]}>

              {notificationOptions.map((option, index) => {
                const isLast = index === notificationOptions.length - 1;
                const isEnabled = preferences[option.id];

                return (
                  <View key={option.id}>
                    <View style={styles.optionRow}>

                      {/* Left: Icon */}
                      <View style={[styles.iconBox, { backgroundColor: option.bg }]}>
                        <Ionicons name={option.icon as any} size={24} color={option.color} />
                      </View>

                      {/* Middle: Text Details */}
                      <View style={styles.textContainer}>
                        <Text style={[styles.optionTitle, { color: theme.colors.text.main }]}>
                          {option.title}
                        </Text>
                        <Text style={[styles.optionDesc, { color: theme.colors.text.muted }]}>
                          {option.desc}
                        </Text>
                      </View>

                      {/* Right: Switch */}
                      <Switch
                        trackColor={{ false: theme.dark ? '#374151' : '#E5E7EB', true: theme.colors.primary }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={theme.dark ? '#374151' : '#E5E7EB'}
                        onValueChange={() => toggleSwitch(option.id)}
                        value={isEnabled}
                      />

                    </View>

                    {/* Divider line for all items except the last one */}
                    {!isLast && (
                      <View style={[styles.divider, { backgroundColor: theme.colors.border?.light || '#F3F4F6' }]} />
                    )}
                  </View>
                );
              })}

            </View>
            {error ? <ErrorMessage message={error}/> : null}
            {/* FOOTER TEXT */}
            <Text style={[styles.footerText, { color: theme.colors.text.placeholder || '#9CA3AF' }]}>
              Poți modifica aceste setări oricând
            </Text>

          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  headerRow: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  listContainer: {
    width: '100%',
  },
  settingsCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden', // Ensures the inner items respect the rounded corners
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' } as any,
    }),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    width: '100%',
    marginLeft: 80, // Indents the divider so it starts after the icon!
  },
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    // On web, adding a pointer cursor makes it feel native
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});