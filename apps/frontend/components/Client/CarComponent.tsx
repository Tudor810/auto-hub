import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  useWindowDimensions
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// --- Types ---
export interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  plate: string;
  fuel: string;
  itpDays: number;
  rcaDays: number;
}

interface CarCardProps {
  car: Car;
  onDelete?: () => void; // Optional: Shows the trash icon
  onEdit?: () => void;   // Optional: Shows the edit pencil icon
}

export default function CarCard({ car, onDelete, onEdit }: CarCardProps) {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();

  // Responsive Layout Logic
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;

  // Dynamic Colors (Dark Mode Support)
  const tagBgColor = theme.dark ? 'rgba(255, 255, 255, 0.1)' : '#F3F4F6';
  const tagTextColor = theme.dark ? '#FFFFFF' : theme.colors.text.secondary;
  const tagBorderColor = theme.dark ? 'rgba(255, 255, 255, 0.2)' : '#E5E7EB';

  // --- Dynamic Status Logic ---
  const getStatusTheme = (days: number) => {
    if (days < 0) {
      return { text: 'Expirat', color: '#EF4444', bg: theme.dark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', weight: 3 };
    } else if (days <= 30) {
      return { text: `${days} zile`, color: '#D97706', bg: theme.dark ? 'rgba(217, 119, 6, 0.15)' : '#FEF3C7', weight: 2 };
    } else {
      return { text: `${days} zile`, color: '#10B981', bg: theme.dark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5', weight: 1 };
    }
  };

  const itpStatus = getStatusTheme(car.itpDays);
  const rcaStatus = getStatusTheme(car.rcaDays);

  const maxWeight = Math.max(itpStatus.weight, rcaStatus.weight);
  const isDanger = maxWeight === 3;
  const isWarning = maxWeight === 2;
  const needsAttention = isDanger || isWarning;

  const attentionColor = isDanger ? '#EF4444' : '#FBBF24';
  const cardBorderColor = needsAttention ? attentionColor : (theme.colors.border?.light || '#E5E7EB');

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.carCard,
          {
            backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
            borderColor: cardBorderColor,
            borderWidth: needsAttention ? 1.5 : 1
          }
        ]}
      >
        <View style={styles.carCardInner}>
          {/* Left: Car Icon Box */}
          <View style={[styles.carIconBox, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
            <Ionicons name="car-outline" size={32} color={theme.colors.text.placeholder || '#94A3B8'} />
          </View>

          {/* Right: Details */}
          <View style={styles.carDetails}>
            
            {/* Title & Action Buttons Row */}
            <View style={styles.carTitleRow}>
              <View style={styles.carMakeModelBox}>
                <Text style={[styles.carMake, { color: theme.colors.text.main }]}>{car.make} {car.model}</Text>
                <Text style={[styles.carYear, { color: theme.colors.text.placeholder || '#9CA3AF' }]}>{car.year}</Text>
              </View>

              {/* ACTION BUTTONS (Edit & Delete) */}
              <View style={styles.actionButtonsRow}>
                {onEdit && (
                  <TouchableOpacity 
                    // Using a light tint of your primary color for the edit button background
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
                    onPress={onEdit}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                
                {onDelete && (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={onDelete}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Tags Row (Plate & Fuel) */}
            <View style={styles.tagsRow}>
              <View style={[styles.tagBadge, { backgroundColor: tagBgColor }]}>
                <Text style={[styles.tagText, { color: tagTextColor }]}>{car.plate}</Text>
              </View>
              <View style={[styles.tagBadge, { backgroundColor: 'transparent', borderWidth: 1, borderColor: tagBorderColor }]}>
                <Text style={[styles.tagText, { color: tagTextColor }]}>{car.fuel}</Text>
              </View>
            </View>

            {/* Status Tags Row (ITP & RCA) */}
            <View style={styles.statusTagsRow}>
              <View style={[styles.statusBadge, { backgroundColor: itpStatus.bg }]}>
                <Ionicons name="document-text-outline" size={12} color={itpStatus.color} />
                <Text style={[styles.statusText, { color: itpStatus.color }]}>ITP: {itpStatus.text}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: rcaStatus.bg }]}>
                <Ionicons name="shield-checkmark-outline" size={12} color={rcaStatus.color} />
                <Text style={[styles.statusText, { color: rcaStatus.color }]}>RCA: {rcaStatus.text}</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

      {/* Warning Badge */}
      {needsAttention && (
        <View style={[styles.warningBadge, { backgroundColor: isDesktop ? theme.colors.surface : theme.colors.background }]}>
          <Ionicons name="warning" size={20} color={attentionColor} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: { position: 'relative', marginBottom: 16, marginTop: 10 },
  carCard: {
    borderRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.03)' } as any,
    }),
  },
  carCardInner: { flexDirection: 'row' },
  carIconBox: {
    width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  carDetails: { flex: 1 },
  carTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  carMakeModelBox: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1, gap: 8 },
  carMake: { fontSize: 18, fontWeight: '800' },
  carYear: { fontSize: 15, fontWeight: '500' },
  
  // New Action Buttons Styles
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tagBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 13, fontWeight: '600' },
  statusTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  warningBadge: { position: 'absolute', top: -12, right: -8, borderRadius: 16, padding: 2, zIndex: 10 },
});