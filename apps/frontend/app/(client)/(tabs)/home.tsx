import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  useWindowDimensions
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CarCard from '@/components/Client/CarComponent';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useCars } from '@/hooks/useCars';


export default function HomeScreen() {
  const theme = useTheme<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {user} = useAuth();
  const router = useRouter();

  const {cars} = useCars();

  // --- Responsive Layout Logic ---
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';


  
  const carsCount = cars.length;

  // --- Category Data Arrays (Grouped for 4 - Tractari - 4 layout) ---
  const topCategories = [
    { icon: "build-outline", title: "Service Auto", iconColor: "#3B82F6", iconBg: "#EFF6FF" },
    { icon: "document-outline", title: "Stație ITP", iconColor: "#10B981", iconBg: "#ECFDF5" },
    { icon: "disc-outline", title: "Vulcanizare", iconColor: "#4B5563", iconBg: "#F3F4F6" },
    { icon: "document-text-outline", title: "Asigurări RCA", iconColor: "#D97706", iconBg: "#FEF3C7" },
  ];

  const bottomCategories = [
    { icon: "sparkles-outline", title: "Detailing", iconColor: "#8B5CF6", iconBg: "#F5F3FF" },
    { icon: "school-outline", title: "Școală Șoferi", iconColor: "#0D9488", iconBg: "#F0FDFA" },
    { icon: "refresh-outline", title: "Redobândire", iconColor: "#3B82F6", iconBg: "#EFF6FF" },
    { icon: "cart-outline", title: "Piese Auto", iconColor: "#EA580C", iconBg: "#FFEDD5" },
  ];

  // --- Sub-Components ---
  const CategoryCard = ({ icon, title, iconColor, iconBg }: any) => {
    const isITP = title === "Stație ITP";

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          {
            backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
            width: isDesktop ? '23.5%' : '31%',
            padding: isDesktop ? 10 : 12,
            aspectRatio: isDesktop ? 1 : 0.85,
          }
        ]}
        activeOpacity={0.7}
      >
        <View style={[
          styles.categoryIconBox,
          {
            backgroundColor: iconBg,
            width: isDesktop ? 38 : 44,
            height: isDesktop ? 38 : 44,
            marginBottom: isDesktop ? 8 : 12,
            position: 'relative', // Ensure we can position the checkmark absolutely
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>
          {/* The Base Icon (e.g., document-outline) */}
          <Ionicons name={icon} size={isDesktop ? 20 : 24} color={iconColor} />

          {/* The Overlay Checkmark for ITP only */}
          {isITP && (
            <Ionicons
              name="checkmark"
              size={isDesktop ? 10 : 12}
              color={iconColor}
              style={{
                position: 'absolute',
                // Adjust these values slightly to center the check on the "paper"
                top: isDesktop ? 13 : 15,
              }}
            />
          )}
        </View>

        <Text
          style={[
            styles.categoryTitle,
            {
              color: theme.colors.text.main,
              fontSize: isDesktop ? 11 : 12
            }
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && { paddingBottom: 40 }]}
      >

        {/* EXTENDED SURFACE CONTAINER (Limits width on Desktop) */}
        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginTop: 40,
            borderRadius: 24,
            ...Platform.select({
              web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any,
              default: { elevation: 4 }
            }),
            overflow: 'hidden'
          }
        ]}>

          {/* HEADER SECTION (BLUE) */}
          <View style={[
            styles.headerSection,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: isDesktop ? 40 : insets.top + 20
            }
          ]}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.welcomeText}>Bun venit,</Text>
                <Text style={styles.nameText}>{user?.fullName.split(" "[0])} 👋</Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Ionicons name="notifications-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Mașinile tale</Text>
                <Text style={styles.statValue}>{carsCount}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Programări active</Text>
                <Text style={styles.statValue}>{user?.activeAppointments || 0}</Text>
              </View>
            </View>
          </View>

          {/* MAIN BODY (WHITE/DARK OVERLAP) */}
          <View style={[
            styles.bodySection,
            { backgroundColor: isDesktop ? theme.colors.surface : theme.colors.background },
            isDesktop && { marginTop: 0, borderRadius: 0, padding: 30 }
          ]}>

            {/* SECTION: CE AI NEVOIE? */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Ce ai nevoie?</Text>

            {/* Top 4 Categories */}
            <View style={[styles.gridRow, isDesktop && { marginBottom: 12 }]}>
              {topCategories.map(cat => (
                <CategoryCard key={cat.title} {...cat} />
              ))}
            </View>

            {/* TRACTĂRI BUTTON */}
            <TouchableOpacity
              style={[
                styles.tractariButton,
                isDesktop && { padding: 12, marginBottom: 12, borderRadius: 12 } // More compact on web
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.tractariIconBox, isDesktop && { padding: 8 }]}>
                <Ionicons name="car-sport-outline" size={isDesktop ? 20 : 24} color="#FFF" />
              </View>
              <View style={styles.tractariTextRow}>
                <Ionicons name="warning-outline" size={isDesktop ? 16 : 18} color="#FFF" />
                <Text style={[styles.tractariText, isDesktop && { fontSize: 16 }]}>Tractări</Text>
              </View>
            </TouchableOpacity>

            {/* Bottom 4 Categories */}
            <View style={styles.gridRow}>
              {bottomCategories.map(cat => (
                <CategoryCard key={cat.title} {...cat} />
              ))}
            </View>

            {/* SECTION: GARAJUL MEU */}
            <View style={styles.garageHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.main, marginBottom: 0 }]}>
                Garajul meu
              </Text>
              <TouchableOpacity onPress={() => router.push("/(client)/my-garage")}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Vezi toate {'>'}</Text>
              </TouchableOpacity>
            </View>

            {carsCount > 0 ? (
              // --- STATE: WITH CAR ---
             cars.map((car) => (
                <CarCard key={car._id} car={car} />
             ))
            ) : (
              // --- STATE: EMPTY GARAGE ---
              <TouchableOpacity
                style={[styles.emptyGarageCard, { borderColor: theme.colors.border?.light || '#E5E7EB', backgroundColor: theme.colors.surface }]}
                activeOpacity={0.7}
                onPress={() => router.push('/(client)/add-car')}
              >
                <View style={[styles.addCarIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="add" size={28} color={theme.colors.primary} />
                </View>
                <Text style={[styles.emptyGarageTitle, { color: theme.colors.text.main }]}>Adaugă prima ta mașină</Text>
                <Text style={[styles.emptyGarageSub, { color: theme.colors.text.muted }]}>
                  Primește alerte pentru ITP, RCA și multe altele
                </Text>
              </TouchableOpacity>
            )}

            {/* Bottom Padding for scroll */}
            <View style={{ height: 40 }} />

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
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  bellButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
  },
  bodySection: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows wrapping on smaller screens
    justifyContent: 'space-between',
    marginBottom: 16,
    rowGap: 12, // Handles vertical spacing when wrapping occurs on mobile
  },
  categoryCard: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryIconBox: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  tractariButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  tractariIconBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 12,
    marginRight: 16,
  },
  tractariTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tractariText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  garageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyGarageCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCarIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyGarageTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyGarageSub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  }
});