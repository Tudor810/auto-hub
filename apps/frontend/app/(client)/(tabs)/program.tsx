import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router'; // or '@react-navigation/native'
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

// Import your custom hook and types
import { useAppointments } from '@/hooks/useAppointments'; // Adjust path
import { IAppointmentResponse } from '@auto-hub/shared/types/appointmentTypes'; // Adjust path

type TabType = 'viitoare' | 'finalizate' | 'toate';

export default function AppointmentsScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('viitoare'); // Defaulting to upcoming

  // Fetch ALL appointments for the logged-in user (passing null/undefined for location)
  const { appointments, isLoading, refreshAppointments } = useAppointments(null);

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshAppointments();
    }, [refreshAppointments])
  );

  // --- Responsive Layout Logic ---
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';
  const innerCardBg = isDesktop ? theme.colors.background : theme.colors.surface;
  const innerCardBorder = isDesktop ? 1 : 0;

  // --- Helpers for Status Badges ---
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'În așteptare', color: '#D97706', bgColor: '#FEF3C7', dotColor: '#F59E0B' };
      case 'confirmed': return { text: 'Confirmat', color: '#059669', bgColor: '#D1FAE5', dotColor: '#10B981' };
      case 'in_progress': return { text: 'În curs', color: '#2563EB', bgColor: '#DBEAFE', dotColor: '#3B82F6' };
      case 'completed': return { text: 'Finalizat', color: '#4B5563', bgColor: '#F3F4F6', dotColor: '#9CA3AF' };
      case 'cancelled': return { text: 'Anulat', color: '#DC2626', bgColor: '#FEE2E2', dotColor: '#EF4444' };
      default: return { text: 'Necunoscut', color: '#6B7280', bgColor: '#F3F4F6', dotColor: '#9CA3AF' };
    }
  };

  // --- Filter Logic ---
  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'toate') return true;
    if (activeTab === 'viitoare') return ['pending', 'confirmed', 'in_progress'].includes(app.status);
    if (activeTab === 'finalizate') return ['completed', 'cancelled'].includes(app.status);
    return true;
  });

  // --- Sub-Components ---
  const FilterTab = ({ id, label, icon }: { id: TabType, label: string, icon: any }) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity 
        style={[
          styles.tabButton, 
          isActive && [
            styles.activeTab, 
            { backgroundColor: innerCardBg, shadowColor: theme.colors.text.main }
          ]
        ]}
        onPress={() => setActiveTab(id)}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={icon} 
          size={16} 
          color={isActive ? theme.colors.text.main : theme.colors.text.muted} 
        />
        <Text style={[
          styles.tabText, 
          { color: isActive ? theme.colors.text.main : theme.colors.text.muted },
          isActive && styles.activeTabText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      <View style={[
        styles.contentWrapper,
        { width: maxWidth },
        isDesktop && {
          backgroundColor: theme.colors.surface,
          marginTop: 40,
          marginBottom: 40,
          borderRadius: 24,
          ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any }),
          overflow: 'hidden'
        }
      ]}>
        
        {/* HEADER SECTION */}
        <View style={[
          styles.headerContainer,
          { 
            paddingTop: isDesktop ? 40 : insets.top + 20,
            borderBottomColor: theme.colors.border?.light || '#F3F4F6',
            borderBottomWidth: isDesktop ? 1 : 0 
          }
        ]}>
          <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>
            Programările mele
          </Text>

          <View style={[styles.tabsContainer, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface + '80' }]}>
            <FilterTab id="viitoare" label="Viitoare" icon="time-outline" />
            <FilterTab id="finalizate" label="Finalizate" icon="checkmark-circle-outline" />
            <FilterTab id="toate" label="Toate" icon="calendar-outline" />
          </View>
        </View>

        {/* APPOINTMENTS LIST */}
        <ScrollView 
          contentContainerStyle={[styles.listContainer, isDesktop && { padding: 30 }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((app: IAppointmentResponse) => {
              const statusStyle = getStatusDisplay(app.status);
              
              // Format date safely
              const formattedDate = app.date 
                ? format(parseISO(app.date), 'dd MMM', { locale: ro }) 
                : '';
              
              return (
                <View 
                  key={app._id} 
                  style={[
                    styles.card, 
                    { 
                      backgroundColor: innerCardBg, 
                      borderColor: theme.colors.border?.light || '#F3F4F6',
                      borderWidth: innerCardBorder,
                      ...Platform.select({
                          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
                          web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } as any,
                      })
                    }
                  ]}
                >
                  {/* TOP ROW */}
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
                        <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                      </View>
                      <View style={styles.titleContent}>
                        <Text style={[styles.dateText, { color: theme.colors.text.main }]}>
                          {formattedDate} <Text style={{ color: theme.colors.text.muted }}>•</Text> {app.time}
                        </Text>
                        <Text style={[styles.providerText, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                          {app.locationId?.name || 'Locație necunoscută'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statusBadge}>
                      <View style={[styles.statusDot, { backgroundColor: statusStyle.dotColor }]} />
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {statusStyle.text}
                      </Text>
                    </View>
                  </View>

                  {/* MIDDLE ROW: Car Info */}
                  <View style={[styles.carInfoBox, { backgroundColor: Platform.OS === 'web' ? theme.colors.surface : theme.colors.background }]}>
                    <Ionicons name="car-outline" size={18} color = {theme.colors.text.secondary} style={styles.carIcon} />
                    <Text style={[styles.carText, { color: theme.colors.text.secondary }]}>
                      {app.carId?.make} {app.carId?.model} – {app.carId?.plateNr}
                    </Text>
                  </View>

                  {/* SERVICES LIST */}
                  <View style={[styles.servicesWrapper, {borderBottomColor: theme.colors.border.medium}]}>
                    {app.serviceIds?.map((service) => (
                      <View key={service._id} style={styles.serviceRow}>
                        <Text style={[styles.serviceName, { color: theme.colors.text.secondary }]}>
                          {service.name}
                        </Text>
                        <Text style={[styles.priceText, { color: theme.colors.text.main }]}>
                          {service.price} RON
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* TOTAL ROW */}
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.colors.text.secondary }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: theme.colors.text.main }]}>
                      {app.totalPrice} RON
                    </Text>
                  </View>

                </View>
              );
            })
          ) : (
            /* EXACT MATCH TO YOUR EMPTY STATE SCREENSHOT */
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text.main }]}>
                {activeTab === 'viitoare' ? 'Nicio programare viitoare' : 
                 activeTab === 'finalizate' ? 'Nicio programare finalizată' : 
                 'Nicio programare'}
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.text.muted }]}>
                Programările tale vor apărea aici
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center' },
  contentWrapper: { flex: 1, width: '100%' },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  tabsContainer: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  activeTab: { elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontSize: 14, fontWeight: '500' },
  activeTabText: { fontWeight: '700' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  loadingState: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleContent: { flex: 1, justifyContent: 'center' },
  dateText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  providerText: { fontSize: 14 },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8},
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 13, fontWeight: '600' },
  
  carInfoBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 16 },
  carIcon: { marginRight: 8 },
  carText: { fontSize: 14, fontWeight: '500' },
  
  servicesWrapper: { borderBottomWidth: 1 , paddingBottom: 12, marginBottom: 12 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceName: { fontSize: 15 },
  priceText: { fontSize: 15, fontWeight: '700' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16 },
  totalAmount: { fontSize: 18, fontWeight: '800' },
  
  // EMPTY STATE STYLES MATCHING SCREENSHOT
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 15, textAlign: 'center' }
});