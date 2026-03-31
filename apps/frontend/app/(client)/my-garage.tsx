import React, { useState } from 'react';
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
import CarCard from '@/components/Client/CarComponent';
import { useNavigation } from 'expo-router';

// --- Mock Data ---
interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  fuel: string;
  itpDays: number;
  rcaDays: number;
}

export default function MyGarageScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // --- Responsive Layout Logic ---
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  // --- Dynamic Colors (Dark Mode Support) ---
  const tagBgColor = theme.dark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6'; // Light gray / subtle dark
  const tagBorderColor = theme.dark ? 'rgba(255, 255, 255, 0.2)' : '#E5E7EB';
  const tagTextColor = theme.dark ? '#FFFFFF' : theme.colors.text.secondary;

  const [cars, setCars] = useState<Car[]>([
    {
      id: '1',
      make: 'Seat',
      model: 'Toledo',
      year: '2017',
      plate: 'B134ABC',
      fuel: 'Diesel',
      itpDays: 5,
      rcaDays: 5,
    }
  ]);

  const carsCount = cars.length;

  // --- Actions ---
  const handleDeleteCar = (id: string) => {
    // Add your delete logic here
    console.log('Delete car:', id);
  };

  const handleAddCar = () => {
    // Navigate to add car screen
    console.log('Navigate to Add Car');
  };

  const navigation = useNavigation();

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          // Push down slightly on desktop, respect safe area on mobile
          { paddingTop: isDesktop ? 40 : insets.top + 20, paddingBottom: 40 }
        ]}
      >

        {/* EXTENDED SURFACE CONTAINER (Limits width on Desktop) */}
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
            <View>
              <Text style={[styles.pageTitle, { color: theme.colors.text.main }]}>Garajul meu</Text>
              <Text style={[styles.pageSubtitle, { color: theme.colors.text.muted }]}>
                {carsCount} mașini înregistrate
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
              onPress={handleAddCar}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adaugă</Text>
            </TouchableOpacity>
          </View>

          {/* CARS LIST */}
          <View style={[styles.listContainer, !isDesktop && { paddingHorizontal: 20 }]}>
            {carsCount > 0 ? (
              cars.map((car, index) => (
                <CarCard
                  key={index}
                  car={car}
                  onDelete={() => { }}
                  onEdit={() => console.log("Navigate to edit")}
                />
              ))
            ) : (
              /* EMPTY STATE */
              <View style={styles.emptyState}>
                <Ionicons name="car-sport-outline" size={48} color={theme.colors.text.placeholder || '#CBD5E1'} />
                <Text style={[styles.emptyStateTitle, { color: theme.colors.text.main }]}>Garajul este gol</Text>
                <Text style={[styles.emptyStateSub, { color: theme.colors.text.muted }]}>
                  Apasă pe butonul "Adaugă" pentru a înregistra prima ta mașină.
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
    alignItems: 'center', // Centers the contentWrapper horizontally on large screens
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    elevation: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    // On web, adding a pointer cursor makes it feel native
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
});