import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { 
  addMonths, subMonths, format, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, 
  isToday, isSameDay 
} from 'date-fns';
import { ro } from 'date-fns/locale';

export default function CalendarScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();

  // Responsive Layout Logic (Same as Profile/Services)
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // Mock Data
  const locations = [
    { id: 'loc1', name: 'Service Centru' },
    { id: 'loc2', name: 'Vulcanizare Nord' },
  ];

  const [activeLocationId, setActiveLocationId] = useState(locations[0].id);

 // --- CALENDAR LOGIC ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Funcție pentru a genera zilele din lună, incluzând completările din luna trecută/viitoare
  const getCalendarDays = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Luni
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const weekDays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'].map(
    (day, index) => {
      // Create a dummy date for each day of the week to get the localized short name
      const date = new Date(2024, 0, index + 1); // Jan 2024 started on a Monday
      return format(date, 'eeeeee', { locale: ro }).toLowerCase();
    }
  );
  const calendarDays = getCalendarDays(currentMonth);

  // Transformăm array-ul plat (de ex 35 de zile) într-un array 2D (Săptămâni de 7 zile) pentru Grid
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Funcții pentru butoanele de navigare
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Titlul formatat: "martie 2026"
  const monthTitle = format(currentMonth, 'MMMM yyyy', { locale: ro });

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    // Aici poți adăuga și logica pentru a încărca programările din acea zi, dacă ai un API pentru asta
  }
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mainContainer}>

        {/* THE EXTENDED SURFACE CONTAINER (Desktop Web) */}
        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginVertical: 40,
            borderRadius: 24,
            ...theme.shadows.card,
            overflow: 'hidden',
            paddingBottom: 40,
          }
        ]}>

          {/* 1. HEADER */}
          <View style={[
            styles.header,
            isDesktop && { paddingTop: 40 }
          ]}>
            <Text style={[styles.title, { color: theme.colors.text.main }]}>Calendar</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.muted }]}>
              Gestionează programările per locație
            </Text>
          </View>

          {/* 2. LOCATION TABS (Esențial pentru 1-to-Many model!) */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
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
                        : { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border.light }
                    ]}
                  >
                    <Text style={[
                      styles.tabText,
                      {
                        color: isActive ? '#FFFFFF' : theme.colors.text.secondary,
                        fontWeight: isActive ? '600' : '400'
                      }
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
      
            {/* 3. CALENDAR WIDGET */}
            <View style={[
              styles.calendarCard, 
              { 
                backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                borderColor: theme.colors.border.light,
                borderWidth: isDesktop ? 1 : 0,
                ...(!isDesktop && theme.shadows.card)
              }
            ]}>
              {/* Calendar Controls */}
              <View style={styles.calendarControls}>
                <TouchableOpacity 
                  onPress={handlePrevMonth}
                  style={[styles.iconButton, { borderColor: theme.colors.border.light }]}
                >
                  <Ionicons name="chevron-back" size={18} color={theme.colors.text.main} />
                </TouchableOpacity>
                
                {/* Titlu Dinamic */}
                <Text style={[styles.monthText, { color: theme.colors.text.main, textTransform: 'capitalize' }]}>
                  {monthTitle}
                </Text>
                
                <TouchableOpacity 
                  onPress={handleNextMonth}
                  style={[styles.iconButton, { borderColor: theme.colors.border.light }]}
                >
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.main} />
                </TouchableOpacity>
              </View>

              {/* Days of week */}
              <View style={styles.weekDaysRow}>
                {weekDays.map((day, index) => (
                  <Text key={index} style={[styles.weekDayText, { color: theme.colors.text.muted }]}>{day}</Text>
                ))}
              </View>

              {/* Grid (Dynamic) */}
              <View style={styles.daysGrid}>
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {week.map((day, dayIndex) => {
                      // Logica dinamică date-fns
                      const dayNumber = format(day, 'd');
                      const isOtherMonth = !isSameMonth(day, currentMonth);
                      const isTodayDay = isToday(day);
                      const isSelected = isSameDay(day, selectedDate);
                      
                      return (
                        <TouchableOpacity 
                          key={dayIndex} 
                          onPress={() => handleSelectDate(day)}
                          style={[
                            styles.dayCell,
                            isSelected && { backgroundColor: theme.colors.primary, borderRadius: 8 } // Highlight pentru ziua selectată
                          ]}
                        >
                          <Text style={[
                            styles.dayText,
                            { color: isOtherMonth ? theme.colors.text.placeholder : theme.colors.text.main },
                            isTodayDay && !isSelected && { color: theme.colors.primary, fontWeight: 'bold' }, // Culoare pentru 'Azi'
                            isSelected && { color: '#FFFFFF', fontWeight: 'bold' } // Text alb pentru ziua selectată
                          ]}>
                            {dayNumber}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* 4. DAILY SCHEDULE SECTION */}
            <Text style={[styles.scheduleTitle, { color: theme.colors.text.main }]}>
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro })}
            </Text>

            <View style={[
              styles.emptyState,
              {
                backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                borderColor: theme.colors.border.light
              }
            ]}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.text.placeholder} />
              <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
                Nicio programare în această zi
              </Text>
            </View>

          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center' },
  contentWrapper: { flex: 1, width: '100%' },

  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, marginTop: 6, opacity: 0.8 },

  tabsContainer: { paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  tabsScrollContent: { paddingHorizontal: 24, gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  tabText: { fontSize: 14 },

  content: { padding: 24 },

  // Calendar Widget Styles
  calendarCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  daysGrid: {
    gap: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 15,
  },

  // Schedule Section
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    // borderStyle: 'dashed', // Dacă preferi border-ul dashed ca la Servicii, decomentează asta
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    textAlign: 'center',
  }
});