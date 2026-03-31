import React from 'react';
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
import { useRouter } from 'expo-router'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {logout} = useAuth();

  // const router = useRouter();

  // Responsive Layout Logic
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';
  const router = useRouter();

  // --- Mock Data ---
  const user = {
    name: "Skillify Ai",
    email: "skillify.ai7@gmail.com",
    carsCount: 0,
    rating: "5.0"
  };

  // --- Reusable Menu Item Component ---
  const MenuItem = ({ icon, title, iconColor, iconBgColor, onPress }: any) => (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        { 
          borderBottomColor: theme.colors.border?.light || '#F3F4F6',
          backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.menuItemText, { color: theme.colors.text.main }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    // Outer container fills the screen and centers the content on Web
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
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
              default: { elevation: 4 } // Fallback if somehow used on a large Android tablet
            }),
            overflow: 'hidden'
          }
        ]}>

          {/* HEADER SECTION */}
          <View style={[
            styles.header, 
            { backgroundColor: theme.colors.primary },
            isDesktop && { paddingTop: 40, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
          ]}>
            <View style={[styles.headerSafeArea, { paddingTop: insets.top }]}>
              <View style={styles.headerContent}>
                
                {/* USER INFO ROW */}
                <View style={styles.userInfoRow}>
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person-outline" size={40} color={theme.colors.primary} />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>

                {/* STATS ROW */}
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{user.carsCount}</Text>
                    <Text style={styles.statLabel}>Mașini</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={20} color="#FBBF24" />
                      <Text style={styles.statNumber}>{user.rating}</Text>
                    </View>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View>

              </View>
            </View>
          </View>

          {/* BODY SECTION */}
          <View style={[
            styles.bodyContainer, 
            { backgroundColor: isDesktop ? 'transparent' : theme.colors.background },
            isDesktop && { padding: 30, borderRadius: 0 }
          ]}>
            
            {/* SECTION: CONTUL MEU */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>CONTUL MEU</Text>
              <View style={[
                styles.cardGroup, 
                { 
                  backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                  borderWidth: isDesktop ? 1 : 0,
                  borderColor: theme.colors.border?.light || '#F3F4F6'
                }
              ]}>
                <MenuItem 
                  icon="car-outline" 
                  title="Mașinile mele" 
                  iconColor="#3B82F6" 
                  iconBgColor="#EFF6FF"
                  onPress={() => router.push("/(client)/my-garage")}
                />
                <MenuItem 
                  icon="document-text-outline" 
                  title="Documente" 
                  iconColor="#10B981" 
                  iconBgColor="#ECFDF5"
                  onPress={() => router.push("/(client)/documents")}
                />
                <MenuItem 
                  icon="notifications-outline" 
                  title="Notificări" 
                  iconColor="#F59E0B" 
                  iconBgColor="#FFFBEB"
                  onPress={() => router.push("/(client)/notifications")}
                />
              </View>
            </View>

            {/* SECTION: PARTENER */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>CĂUTARE</Text>
              <View style={[
                styles.cardGroup, 
                { 
                  backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                  borderWidth: isDesktop ? 1 : 0,
                  borderColor: theme.colors.border?.light || '#F3F4F6'
                }
              ]}>
                <MenuItem 
                  icon="search-outline" 
                  title="Magic Search" 
                  iconColor="#8B5CF6" 
                  iconBgColor="#F5F3FF"
                  onPress={() => console.log('Navigate to Partner Registration')}
                />
              </View>
            </View>

            {/* SECTION: ALTELE */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>ALTELE</Text>
              <View style={[
                styles.cardGroup, 
                { 
                  backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                  borderWidth: isDesktop ? 1 : 0,
                  borderColor: theme.colors.border?.light || '#F3F4F6'
                }
              ]}>
                <MenuItem 
                  icon="help-circle-outline" 
                  title="Ajutor & Suport" 
                  iconColor="#6B7280" 
                  iconBgColor="#F3F4F6"
                  onPress={() => router.push("(client)/help") }
                />
                <MenuItem 
                  icon="log-out-outline" 
                  title="Deconectare" 
                  iconColor="#EF4444" 
                  iconBgColor="#FEF2F2"
                  onPress= {logout}
                />
              </View>
            </View>

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
    alignItems: 'center', // Centers the contentWrapper horizontally on wide screens
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
  },
  header: {
    // Mobile overlap style handled by bodyContainer's negative margin/radius
  },
  headerSafeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40, // Increased bottom padding to accommodate rounded body corner overlap on mobile
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' } as any,
    })
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  bodyContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, // Pulls the body up to overlap the header on mobile
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});