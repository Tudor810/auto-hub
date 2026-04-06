import React, { useMemo, useCallback } from 'react'; // Added useCallback
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRouter } from 'expo-router'; // Added useFocusEffect
import { useCars } from '@/hooks/useCars'; 
import { ICar } from '@auto-hub/shared/types/carTypes'; 

// --- Types ---
interface DocumentAlert {
  id: string;
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
  
  // 1. FETCH REAL DATA (Make sure useCars exports refreshCars or fetchCars!)
  const { cars, isLoading, refreshCars } = useCars();

  // 2. TRIGGER REFRESH ON FOCUS
  useFocusEffect(
    useCallback(() => {
      if (refreshCars) {
        refreshCars();
      }
    }, [refreshCars])
  );

  // Responsive Layout
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // HELPER FUNCTION: Safely calculate days left
  const getDaysLeft = (dateInput: Date | string | null | undefined): number | null => {
    if (!dateInput) return null; 

    const targetDate = new Date(dateInput); 
    const today = new Date();
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays;
  };

  // FLATTEN & SORT ALERTS
  const criticalDocuments = useMemo(() => {
    const alerts: DocumentAlert[] = [];

    if (cars && cars.length > 0) {
      cars.forEach((car: ICar) => {
        const carName = `${car.make} ${car.model}`;

        const itpDays = getDaysLeft(car.itpDate);
        const rcaDays = getDaysLeft(car.rcaDate);
        const rovinietaDays = getDaysLeft(car.rovinietaDate);

        if (itpDays !== null && itpDays <= 30) {
          alerts.push({ id: `${car._id}-itp`, carId: car._id, carName, plate: car.plateNr, docType: 'ITP', daysLeft: itpDays });
        }
        if (rcaDays !== null && rcaDays <= 30) {
          alerts.push({ id: `${car._id}-rca`, carId: car._id, carName, plate: car.plateNr, docType: 'RCA', daysLeft: rcaDays });
        }
        if (rovinietaDays !== null && rovinietaDays <= 30) {
          alerts.push({ id: `${car._id}-rov`, carId: car._id, carName, plate: car.plateNr, docType: 'Rovinietă', daysLeft: rovinietaDays });
        }
      });
    }

    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [cars]); 

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
  const router = useRouter();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>

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
            {isLoading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : criticalDocuments.length > 0 ? (
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
                        borderLeftColor: status.color, 
                      }
                    ]}
                    activeOpacity={0.7}
                    onPress={() => router.push({
                      pathname: "/(client)/add-car",
                      params: {id: doc.carId, origin: 'documents'}
                    })}
                  >
                    <View style={[styles.iconBox, { backgroundColor: status.iconBg }]}>
                      <Ionicons name="warning-outline" size={24} color={status.color} />
                    </View>

                    <View style={styles.textContainer}>
                      <Text style={[styles.docType, { color: theme.colors.text.main }]}>{doc.docType}</Text>
                      <Text style={[styles.carInfo, { color: theme.colors.text.muted }]}>
                        {doc.carName} • {doc.plate}
                      </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.text}
                      </Text>
                    </View>

                  </TouchableOpacity>
                );
              })
            ) : (
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
  mainContainer: { flex: 1 },
  scrollContent: { alignItems: 'center' },
  contentWrapper: { flex: 1, width: '100%' },
  headerRow: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  pageSubtitle: { fontSize: 15, fontWeight: '500' },
  listContainer: { width: '100%', gap: 16 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderLeftWidth: 5, 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' } as any,
    }),
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  docType: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  carInfo: { fontSize: 14, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 10 },
  statusText: { fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyStateSub: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  backButton: { marginBottom: 16, alignSelf: 'flex-start', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) },
});