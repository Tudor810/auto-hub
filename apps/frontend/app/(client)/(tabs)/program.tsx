import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Types ---
type TabType = 'viitoare' | 'finalizate' | 'toate';
type AppointmentStatus = 'pending' | 'completed' | 'upcoming';

interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  status: AppointmentStatus;
  carName: string;
  serviceName: string;
  price: number;
}

export default function AppointmentsScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabType>('toate');

  // --- Responsive Layout Logic ---
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // --- Dynamic Colors based on Layout ---
  // If the desktop wrapper is 'surface', we make the inner cards 'background' for contrast
  const innerCardBg = isDesktop ? theme.colors.background : theme.colors.surface;
  const innerCardBorder = isDesktop ? 1 : 0;

  // --- Mock Data ---
  const MOCK_APPOINTMENTS: Appointment[] = [
    {
      id: '1',
      date: '29 mar',
      time: '14:00',
      provider: 'ProDrive Școala de Șoferi',
      status: 'pending',
      carName: 'Seat Toledo - B134ABC',
      serviceName: 'Curs categoria B',
      price: 1800,
    }
  ];

  // --- Helpers for Status Badges ---
  const getStatusDisplay = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return { text: 'În așteptare', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'completed':
        return { text: 'Finalizat', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      case 'upcoming':
        return { text: 'Confirmat', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
    }
  };

  // --- Filter Logic ---
  const filteredAppointments = MOCK_APPOINTMENTS.filter(app => {
    if (activeTab === 'toate') return true;
    if (activeTab === 'viitoare') return app.status === 'upcoming' || app.status === 'pending';
    if (activeTab === 'finalizate') return app.status === 'completed';
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
          ...Platform.select({
            web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any,
            default: { elevation: 4 }
          }),
          overflow: 'hidden'
        }
      ]}>
        
        {/* HEADER SECTION (Fixed at top of wrapper) */}
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

          {/* TABS */}
          <View style={[
            styles.tabsContainer, 
            { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface + '80' }
          ]}>
            <FilterTab id="viitoare" label="Viitoare" icon="time-outline" />
            <FilterTab id="finalizate" label="Finalizate" icon="checkmark-circle-outline" />
            <FilterTab id="toate" label="Toate" icon="calendar-outline" />
          </View>
        </View>

        {/* APPOINTMENTS LIST (Scrollable within wrapper) */}
        <ScrollView 
          contentContainerStyle={[styles.listContainer, isDesktop && { padding: 30 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => {
              const statusStyle = getStatusDisplay(app.status);
              
              return (
                <View 
                  key={app.id} 
                  style={[
                    styles.card, 
                    { 
                      backgroundColor: innerCardBg, 
                      shadowColor: theme.colors.text.main,
                      borderWidth: innerCardBorder,
                      borderColor: theme.colors.border?.light || '#F3F4F6'
                    }
                  ]}
                >
                  {/* TOP ROW: Icon, Date, Provider, Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                        <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                      </View>
                      <View style={styles.titleContent}>
                        <Text style={[styles.dateText, { color: theme.colors.text.main }]}>
                          {app.date} <Text style={{ color: theme.colors.text.muted }}>•</Text> {app.time}
                        </Text>
                        <Text style={[styles.providerText, { color: theme.colors.text.secondary }]}>
                          {app.provider}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {statusStyle.text}
                      </Text>
                    </View>
                  </View>

                  {/* MIDDLE ROW: Car Info */}
                  <View style={[
                    styles.carInfoBox, 
                    { backgroundColor: isDesktop ? theme.colors.surface : theme.colors.background }
                  ]}>
                    <Ionicons name="car-outline" size={18} color={theme.colors.text.secondary} style={styles.carIcon} />
                    <Text style={[styles.carText, { color: theme.colors.text.secondary }]}>
                      {app.carName}
                    </Text>
                  </View>

                  {/* BOTTOM ROW: Service Details & Price */}
                  <View style={styles.serviceRow}>
                    <Text style={[styles.serviceName, { color: theme.colors.text.secondary }]}>
                      {app.serviceName}
                    </Text>
                    <Text style={[styles.priceText, { color: theme.colors.text.main }]}>
                      {app.price} RON
                    </Text>
                  </View>

                  {/* DIVIDER */}
                  <View style={[styles.divider, { backgroundColor: theme.colors.border?.light || '#F3F4F6' }]} />

                  {/* TOTAL ROW */}
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.colors.text.secondary }]}>Total</Text>
                    <Text style={[styles.totalAmount, { color: theme.colors.text.main }]}>
                      {app.price} RON
                    </Text>
                  </View>

                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={48} color={theme.colors.text.placeholder} />
              <Text style={[styles.emptyStateText, { color: theme.colors.text.muted }]}>
                Nu ai nicio programare în această categorie.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center', // Centers the contentWrapper on large screens
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  titleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  providerText: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  carInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  carIcon: {
    marginRight: 10,
  },
  carText: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 15,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  }
});