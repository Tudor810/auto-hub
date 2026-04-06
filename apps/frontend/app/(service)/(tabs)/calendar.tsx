import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import {
  addMonths, subMonths, format, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
  isToday, isSameDay
} from 'date-fns';
import { ro } from 'date-fns/locale';
import { useBusiness } from '@/context/BusinessContext';
import { useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useAppointments } from '@/hooks/useAppointments'; 
import { IAppointmentResponse } from '@auto-hub/shared/types/appointmentTypes';

export default function CalendarScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();
  const { locations } = useBusiness();
  const { id } = useLocalSearchParams();

  // --- LOCATION STATE ---
  const [activeLocationId, setActiveLocationId] = useState<string | null>(() => {
    if (id) return id as string;
    if (locations.length > 0) return locations[0]._id;
    return null;
  });

  useEffect(() => {
    if (!activeLocationId && locations.length > 0) {
      setActiveLocationId((id as string) || locations[0]._id);
    }
  }, [locations, id]);

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // --- FETCH APPOINTMENTS FOR ACTIVE LOCATION ---
  const { appointments, isLoading, updateAppointment } = useAppointments(activeLocationId);
  
  // --- CALENDAR LOGIC ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getCalendarDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'].map(
    (day, index) => {
      const date = new Date(2024, 0, index + 1); 
      return format(date, 'eeeeee', { locale: ro }).toLowerCase();
    }
  );
  
  const calendarDays = getCalendarDays(currentMonth);
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const monthTitle = format(currentMonth, 'MMMM yyyy', { locale: ro });

  // --- FILTER APPOINTMENTS FOR SELECTED DATE ---
  const selectedAppointments = appointments.filter(app => {
    if (!app.date) return false;
    const appDateStr = app.date.split('T')[0]; 
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return appDateStr === selectedDateStr;
  });

  // --- STATUS HANDLER ---
  const handleStatusChange = async (appId: string, newStatus: IAppointmentResponse['status']) => {
    const res = await updateAppointment(appId, { status: newStatus } as any);
    if (!res.success) {
      if (Platform.OS === 'web') alert(res.error);
      else Alert.alert('Eroare', res.error);
    }
  };

  // --- STATUS BADGE HELPER (Updated for text-only styling) ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'ÎN AȘTEPTARE', color: '#D97706' };
      case 'confirmed': return { text: 'CONFIRMAT', color: '#10B981' };
      case 'in_progress': return { text: 'ÎN CURS', color: '#3B82F6' };
      case 'completed': return { text: 'FINALIZAT', color: theme.colors.text.muted || '#6B7280' };
      case 'cancelled': return { text: 'ANULAT', color: '#EF4444' };
      default: return { text: status.toUpperCase(), color: theme.colors.text.muted || '#6B7280' };
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainContainer}>

        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginVertical: 40,
            borderRadius: 24,
            ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any }),
            overflow: 'hidden',
            paddingBottom: 40,
          }
        ]}>

          {/* 1. HEADER */}
          <View style={[styles.header, isDesktop && { paddingTop: 40 }]}>
            <Text style={[styles.title, { color: theme.colors.text.main }]}>Calendar</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.muted }]}>
              Gestionează programările per locație
            </Text>
          </View>

          {/* 2. LOCATION TABS */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
              {locations.map((loc) => {
                const isActive = loc._id === activeLocationId;
                return (
                  <TouchableOpacity
                    key={loc._id}
                    onPress={() => setActiveLocationId(loc._id)}
                    activeOpacity={0.7}
                    style={[
                      styles.tab,
                      isActive
                        ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                        : { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border?.light || '#E5E7EB' }
                    ]}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: isActive ? '#FFFFFF' : theme.colors.text.secondary, fontWeight: isActive ? '600' : '400' }
                    ]}>
                      {loc.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.content}>

            {/* 3. CALENDAR WIDGET */}
            <View style={[
              styles.calendarCard,
              {
                backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                borderColor: theme.colors.border?.light || '#E5E7EB',
                borderWidth: isDesktop ? 1 : 0,
                ...(!isDesktop && Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, android: { elevation: 2 }, web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } as any }))
              }
            ]}>
              <View style={styles.calendarControls}>
                <TouchableOpacity onPress={handlePrevMonth} style={[styles.iconButton, { borderColor: theme.colors.border?.light || '#E5E7EB' }]}>
                  <Ionicons name="chevron-back" size={18} color={theme.colors.text.main} />
                </TouchableOpacity>
                <Text style={[styles.monthText, { color: theme.colors.text.main, textTransform: 'capitalize' }]}>{monthTitle}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={[styles.iconButton, { borderColor: theme.colors.border?.light || '#E5E7EB' }]}>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.main} />
                </TouchableOpacity>
              </View>

              <View style={styles.weekDaysRow}>
                {weekDays.map((day, index) => (
                  <Text key={index} style={[styles.weekDayText, { color: theme.colors.text.muted }]}>{day}</Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {week.map((day, dayIndex) => {
                      const dayNumber = format(day, 'd');
                      const isOtherMonth = !isSameMonth(day, currentMonth);
                      const isTodayDay = isToday(day);
                      const isSelected = isSameDay(day, selectedDate);

                      const hasAppointments = appointments.some(app => app.date && app.date.split('T')[0] === format(day, 'yyyy-MM-dd'));

                      return (
                        <TouchableOpacity
                          key={dayIndex}
                          onPress={() => setSelectedDate(day)}
                          style={[
                            styles.dayCell,
                            isSelected && { backgroundColor: theme.colors.primary, borderRadius: 8 }
                          ]}
                        >
                          <Text style={[
                            styles.dayText,
                            { color: isOtherMonth ? theme.colors.text.placeholder || '#9CA3AF' : theme.colors.text.main },
                            isTodayDay && !isSelected && { color: theme.colors.primary, fontWeight: 'bold' },
                            isSelected && { color: '#FFFFFF', fontWeight: 'bold' }
                          ]}>
                            {dayNumber}
                          </Text>
                          {hasAppointments && !isSelected && <View style={[styles.eventDot, { backgroundColor: theme.colors.primary }]} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* 4. DAILY SCHEDULE SECTION */}
            <Text style={[styles.scheduleTitle, { color: theme.colors.text.main }]}>
              Programări • {format(selectedDate, 'd MMMM yyyy', { locale: ro })}
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : selectedAppointments.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border?.light || '#E5E7EB' }]}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.text.placeholder || '#9CA3AF'} />
                <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
                  Nicio programare în această zi
                </Text>
              </View>
            ) : (
              <View style={styles.appointmentList}>
                {selectedAppointments.map(app => {
                  const conf = getStatusConfig(app.status);
                  
                  return (
                    <View key={app._id} style={[styles.appointmentCard, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border?.light || '#E5E7EB' }]}>

                      {/* Top Row: Time & Status */}
                      <View style={styles.cardTopRow}>
                        <View style={styles.timeBadge}>
                          <Ionicons name="time-outline" size={18} color={theme.colors.text.main} />
                          <Text style={[styles.timeText, { color: theme.colors.text.main }]}>{app.time}</Text>
                        </View>
                        {/* Text-only Status */}
                        <View style={styles.badge}>
                          <Text style={{ color: conf.color, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }}>{conf.text}</Text>
                        </View>
                      </View>

                      {/* Middle Row: Client & Car */}
                      <View style={styles.clientDetails}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <Text style={[styles.carMakeText, { color: theme.colors.text.main }]}>
                            {app.carId?.make} {app.carId?.model}
                          </Text>

                          {/* Client Name */}
                          <Text style={{ color: theme.colors.text.main, fontSize: 14, marginTop: 4, fontWeight: '600' }}>
                            👤 {app.clientId?.fullName || 'Client necunoscut'}
                          </Text>

                          {/* Contact Info Row */}
                          <View style={styles.contactRow}>
                            {app.clientId?.phoneNumber && (
                              <TouchableOpacity
                                style={styles.contactPill}
                                onPress={() => Linking.openURL(`tel:${app.clientId.phoneNumber}`)}
                                activeOpacity={0.7}
                              >
                                <Ionicons name="call" size={12} color={theme.colors.primary} />
                                <Text style={[styles.contactTextBlue, {color: theme.colors.primary}]}>{app.clientId.phoneNumber}</Text>
                              </TouchableOpacity>
                            )}

                            {app.clientId?.email && (
                              <View style={styles.contactPill}>
                                <Ionicons name="mail" size={12} color={theme.colors.text.muted} />
                                <Text style={[styles.contactText, { color: theme.colors.text.muted }]} numberOfLines={1}>
                                  {app.clientId.email}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Theme-aware Car Plate */}
                        <View style={[styles.plateBadge, { backgroundColor: theme.colors.background, borderColor: theme.colors.border?.medium || '#D1D5DB' }]}>
                          <Text style={[styles.plateText, { color: theme.colors.text.main }]}>{app.carId?.plateNr}</Text>
                        </View>
                      </View>

                      {/* ENHANCED SERVICES LIST */}
                      <View style={[styles.servicesList, { borderTopColor: theme.colors.border?.light || '#F3F4F6' }]}>
                        <Text style={[styles.servicesTitle, { color: theme.colors.text.main }]}>Servicii programate:</Text>

                        {app.serviceIds?.map((svc, idx) => (
                          <View key={idx} style={styles.serviceRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                              <Ionicons name="build-outline" size={14} color={theme.colors.text.muted} style={{ marginRight: 6 }} />
                              <Text style={{ color: theme.colors.text.secondary, fontSize: 14, flexShrink: 1 }}>
                                {svc.name}
                              </Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{ color: theme.colors.text.main, fontSize: 14, fontWeight: '600' }}>
                                {svc.price} RON
                              </Text>
                              <Text style={{ color: theme.colors.text.muted, fontSize: 12 }}>
                                ⏱ {svc.duration} min
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Total Row */}
                      <View style={styles.totalRow}>
                        <Text style={{ color: theme.colors.text.muted, fontSize: 14 }}>Timp total estimat: {app.totalDuration} min</Text>
                        <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: '800' }}>{app.totalPrice} RON</Text>
                      </View>

                      {/* Action Buttons based on status */}
                      <View style={styles.actionButtons}>
                        {app.status === 'pending' && (
                          <>
                            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleStatusChange(app._id, 'confirmed')}>
                              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                              <Text style={styles.btnTextWhite}>Acceptă</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleStatusChange(app._id, 'cancelled')}>
                              <Text style={styles.btnTextRed}>Respinge</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {app.status === 'confirmed' && (
                          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6', flex: 1 }]} onPress={() => handleStatusChange(app._id, 'in_progress')}>
                            <Ionicons name="play-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.btnTextWhite}>Începe Lucrarea</Text>
                          </TouchableOpacity>
                        )}
                        {app.status === 'in_progress' && (
                          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981', flex: 1 }]} onPress={() => handleStatusChange(app._id, 'completed')}>
                            <Ionicons name="flag-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.btnTextWhite}>Marchează Finalizat</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                    </View>
                  )
                })}
              </View>
            )}

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center' },
  contentWrapper: { flex: 1, width: '100%' },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 60 : 40, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, marginTop: 6, opacity: 0.8 },
  tabsContainer: { paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  tabsScrollContent: { paddingHorizontal: 24, gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  tabText: { fontSize: 14 },
  content: { padding: 24 },

  calendarCard: { borderRadius: 16, padding: 20, marginBottom: 32 },
  calendarControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconButton: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 16, fontWeight: '700' },
  weekDaysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  weekDayText: { fontSize: 13, fontWeight: '600', width: 30, textAlign: 'center' },
  daysGrid: { gap: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dayCell: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  dayText: { fontSize: 15 },
  eventDot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 2 },

  scheduleTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 16, borderWidth: 1 },
  emptyText: { marginTop: 16, fontSize: 15, textAlign: 'center' },

  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  contactPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(150,150,150,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  contactText: { fontSize: 12, fontWeight: '500' },
  contactTextBlue: { fontSize: 12, fontWeight: '600' },
  
  // New Appointment Card Styles
  appointmentList: { gap: 16 },
  appointmentCard: { padding: 16, borderRadius: 16, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' } as any }) },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 18, fontWeight: '800' },
  badge: { paddingVertical: 4 }, // Removed background & hardcoded paddings

  clientDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  carMakeText: { fontSize: 16, fontWeight: '600' },
  
  // Plate Badge dynamically updated inline, removed hardcoded colors here
  plateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  plateText: { fontSize: 13, fontWeight: '700' },

  // Services Section
  servicesList: { paddingTop: 12, paddingBottom: 4, borderTopWidth: 1, marginBottom: 12 },
  servicesTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  // Buttons
  actionButtons: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#FEE2E2' },
  btnTextWhite: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  btnTextRed: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});