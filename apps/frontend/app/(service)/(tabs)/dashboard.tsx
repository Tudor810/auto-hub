import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useBusiness } from '@/context/BusinessContext';
import { useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useServices } from '@/hooks/useServices';

export default function DashboardScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();
  const { locations } = useBusiness();


  const { id } = useLocalSearchParams();

  const [activeLocationId, setActiveLocationId] = useState<string | null>(() => {
    if (id) return id;
    if (locations.length > 0) return locations[0]._id;
    return null;
  });


  const { services, refreshServices } = useServices(activeLocationId);

  useFocusEffect(
    useCallback(() => {
      if (activeLocationId) {
        refreshServices();
      }
    }, [activeLocationId, refreshServices])
  );

  // Responsive Logic
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';
  const selectedLocation: ILocation = locations.find(loc => loc._id === activeLocationId) || null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainContainer}>

        {/* EXTENDED SURFACE CONTAINER (For Desktop) */}
        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginVertical: 40,
            borderRadius: 24,
            ...theme.shadows.card,
            overflow: 'hidden',
          }
        ]}>

          {/* 1. DARK HEADER SECTION (Refined for True Dark Mode) */}
          <View style={[
            styles.darkHeader,
            { backgroundColor: theme.colors.surface },
            isDesktop && { paddingTop: 40 }
          ]}>

            {/* Title Row */}
            <View style={styles.headerTopRow}>
              <View>
                <Text style={[styles.headerSubtitle, { color: theme.colors.text.muted }]}>Dashboard</Text>
                <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>Rezumat Activitate</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                <Text style={[styles.statusText, { color: '#10B981' }]}>Activ</Text>
              </View>
            </View>

            {/* LOCATION SELECTOR */}
            <View style={styles.tabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
                {locations.map((loc) => {
                  const isActive = loc.id === activeLocationId;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => setActiveLocationId(loc.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.tab,
                        isActive
                          ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                          : { backgroundColor: theme.colors.background, borderColor: theme.colors.border.medium }
                      ]}
                    >
                      <Text style={[
                        styles.tabText,
                        { color: isActive ? '#FFFFFF' : theme.colors.text.secondary, fontWeight: isActive ? '700' : '500' }
                      ]}>
                        {loc.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* THE 4 STAT CARDS */}
            <View style={styles.statsGrid}>

              <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Azi</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text.main }]}>0</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="time-outline" size={16} color="#F59E0B" />
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>În așteptare</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text.main }]}>0</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Finalizate</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text.main }]}>0</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: theme.colors.background }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-up-outline" size={16} color="#8B5CF6" />
                  <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Venit Luna</Text>
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text.main }]}>
                  0 <Text style={[styles.currencyText, { color: theme.colors.text.muted }]}>RON</Text>
                </Text>
              </View>

            </View>
          </View>
          {/* END DARK HEADER */}


          {/* 2. MAIN CONTENT */}
          <View style={[styles.contentArea, isDesktop && { paddingHorizontal: 32 }]}>

            {/* QUICK ACTIONS */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(service)/(tabs)/calendar')}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                  <Ionicons name="calendar" size={24} color="#3B82F6" />
                </View>
                <Text style={[styles.actionText, { color: theme.colors.text.main }]}>Calendar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(service)/(tabs)/services')}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="briefcase" size={24} color="#10B981" />
                </View>
                <Text style={[styles.actionText, { color: theme.colors.text.main }]}>Servicii</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(service)/(tabs)/profile')}>
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                  <Ionicons name="person" size={24} color="#A855F7" />
                </View>
                <Text style={[styles.actionText, { color: theme.colors.text.main }]}>Profil</Text>
              </TouchableOpacity>
            </View>

            {/* PROGRAMUL DE AZI */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Programul de azi</Text>
              <TouchableOpacity onPress={() => router.push('/(service)/(tabs)/calendar')}>
                <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>Vezi calendar</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.emptyStateCard, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border.light }]}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={32} color={theme.colors.text.placeholder} />
              </View>
              <Text style={[styles.emptyStateText, { color: theme.colors.text.muted }]}>
                Nicio programare pentru azi la {selectedLocation.name}
              </Text>
            </View>

            {/* SERVICIILE TALE */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Serviciile tale</Text>
              <TouchableOpacity onPress={() => router.push('/(service)/(tabs)/services')}>
                <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>Gestionează {'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.servicesCard, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border.light }]}>
              <View>
                <Text style={[styles.servicesCount, { color: theme.colors.text.main }]}>{services.length}</Text>
                <Text style={[styles.servicesLabel, { color: theme.colors.text.muted }]}>servicii active</Text>
              </View>
              <TouchableOpacity
                style={[styles.addServiceBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/(service)/(tabs)/services')}
              >
                <Text style={styles.addServiceText}>Adaugă serviciu</Text>
              </TouchableOpacity>
            </View>

          </View>
          {/* END MAIN CONTENT */}

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center' },
  contentWrapper: { flex: 1, width: '100%' },

  /* DARK HEADER STYLES */
  darkHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerSubtitle: { fontSize: 14, marginBottom: 2, fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },

  /* TABS */
  tabsContainer: { marginBottom: 24, marginHorizontal: -20 },
  tabsScrollContent: { paddingHorizontal: 20, gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  tabText: { fontSize: 14 },

  /* 4 STATS GRID */
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statBox: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { fontSize: 13, marginLeft: 6, fontWeight: '600' },
  statValue: { fontSize: 26, fontWeight: '800' },
  currencyText: { fontSize: 14, fontWeight: '600' },

  /* WHITE/DARK CONTENT AREA */
  contentArea: { padding: 24, paddingBottom: 60 },

  /* QUICK ACTIONS */
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    marginTop: -40, // Pulls the buttons slightly up to overlap the top header
  },
  actionBtn: { alignItems: 'center', width: '30%' },
  actionIconBox: {
    width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' } as any
    })
  },
  actionText: { fontSize: 13, fontWeight: '600' },

  /* SECTIONS */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionLink: { fontSize: 14, fontWeight: '600' },

  emptyStateCard: { alignItems: 'center', justifyContent: 'center', padding: 32, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(150,150,150,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyStateText: { fontSize: 14, textAlign: 'center' },

  servicesCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1 },
  servicesCount: { fontSize: 28, fontWeight: '800', marginBottom: 2 },
  servicesLabel: { fontSize: 13 },
  addServiceBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addServiceText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});