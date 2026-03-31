import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StatusBar
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

// --- Types ---
interface Car {
  id: string;
  make: string;
  model: string;
  plate: string;
  itpDays: number;
  rcaDays: number;
  rovinietaDays: number; // Added based on your screenshot
}

interface DocumentAlert {
  id: string; // Unique ID for the list
  carId: string;
  carName: string;
  plate: string;
  docType: string;
  daysLeft: number;
}

export default function DocumentsScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Responsive Layout
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // --- Mock Data ---
  // In reality, you will fetch this from your database/state
  const mockCars: Car[] = [
    { id: '1', make: 'Seat', model: 'Toledo', plate: 'B134ABC', itpDays: -5, rcaDays: -2, rovinietaDays: 14 },
    { id: '2', make: 'BMW', model: 'Seria 3', plate: 'CJ22XYZ', itpDays: 120, rcaDays: 8, rovinietaDays: 300 },
  ];

  // --- Logic: Flatten, Filter, and Sort the Alerts ---
  const criticalDocuments = useMemo(() => {
    const alerts: DocumentAlert[] = [];

    mockCars.forEach((car) => {
      const carName = `${car.make} ${car.model}`;

      // Only push documents that have 30 days or less remaining
      if (car.itpDays <= 30) {
        alerts.push({ id: `${car.id}-itp`, carId: car.id, carName, plate: car.plate, docType: 'ITP', daysLeft: car.itpDays });
      }
      if (car.rcaDays <= 30) {
        alerts.push({ id: `${car.id}-rca`, carId: car.id, carName, plate: car.plate, docType: 'RCA', daysLeft: car.rcaDays });
      }
      if (car.rovinietaDays <= 30) {
        alerts.push({ id: `${car.id}-rov`, carId: car.id, carName, plate: car.plate, docType: 'Rovinietă', daysLeft: car.rovinietaDays });
      }
    });

    // Sort by most urgent (lowest days first)
    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [mockCars]);

  // --- Status Theme Helper ---
  const getStatusTheme = (days: number) => {
    if (days < 0) {
      return {
        text: 'Expirat',
        color: '#EF4444',
        bg: theme.dark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
        iconBg: theme.dark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2'
      };
    } else {
      return {
        text: `${days} zile`,
        color: '#D97706',
        bg: theme.dark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7',
        iconBg: theme.dark ? 'rgba(217, 119, 6, 0.1)' : '#FFFBEB'
      };
    }
  };

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
            <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Documente</Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>
              Monitorizează expirările importante
            </Text>
          </View>

          {/* DOCUMENTS LIST */}
          <View style={[styles.listContainer, !isDesktop && { paddingHorizontal: 20 }]}>
            {criticalDocuments.length > 0 ? (
              criticalDocuments.map((doc) => {
                const status = getStatusTheme(doc.daysLeft);

                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[
                      styles.docCard,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border?.light || '#F3F4F6',
                        borderLeftColor: status.color, // The thick colored left border
                      }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => console.log('Navigate to Car Details for ID:', doc.carId)}
                  >

                    {/* Icon Box */}
                    <View style={[styles.iconBox, { backgroundColor: status.iconBg }]}>
                      <Ionicons name="warning-outline" size={24} color={status.color} />
                    </View>

                    {/* Text Details */}
                    <View style={styles.textContainer}>
                      <Text style={[styles.docType, { color: theme.colors.text.main }]}>{doc.docType}</Text>
                      <Text style={[styles.carInfo, { color: theme.colors.text.muted }]}>
                        {doc.carName} • {doc.plate}
                      </Text>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>

                  </TouchableOpacity>
                );
              })
            ) : (
              /* EMPTY STATE: Everything is safe! */
              <View style={styles.emptyState}>
                <View style={[styles.emptyIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                </View>
                <Text style={[styles.emptyStateTitle, { color: theme.colors.text.main }]}>
                  Totul este la zi!
                </Text>
                <Text style={[styles.emptyStateSub, { color: theme.colors.text.muted }]}>
                  Niciun document nu expiră în următoarele 30 de zile.
                </Text>
              </View>
            )}
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
    gap: 16, // Adds space between the cards
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 5, // Creates that distinct left edge from your screenshot
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' } as any,
    }),
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
  },
  docType: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  carInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    // On web, adding a pointer cursor makes it feel native
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});