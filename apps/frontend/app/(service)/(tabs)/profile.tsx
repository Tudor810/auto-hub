import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import EditCompanyModal from '@/components/Services/EditCompanyModal';
import { ICompany, ICompanyFormData } from '@auto-hub/shared/types/companyTypes'
import { useBusiness } from '@/context/BusinessContext';

export default function ProfileScreen() {
  const theme = useTheme<any>();
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const { company, isLoadingBusiness, saveCompanyData, locations} = useBusiness();
  const { user } = useAuth()

  // Responsive Layout Logic
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800;
  const maxWidth = isDesktop ? 800 : '100%';

  const [error, setError] = useState("")
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isClosable, setIsClosable] = useState(true)

  const initialCompanyData: ICompanyFormData = {
    name: company?.name || '',
    admin: company?.admin || user?.fullName || '',
    email: company?.email || user?.email || '',
    phone: company?.phone || user?.phoneNumber || '',
    cui: company?.cui || '',
    regCom: company?.regCom || '',
  };

  useEffect(() => {
    // Dacă am terminat de încărcat și nu există nicio companie, deschidem modalul obligatoriu
    if (!isLoadingBusiness && !company) {
      setIsClosable(false)
      setIsEditModalVisible(true);
    }
  }, [isLoadingBusiness, company]);

  const handleSaveChanges = async (formData: ICompanyFormData) => {

    const result = await saveCompanyData(formData)

    if(result.success) {
      setIsEditModalVisible(false)
    } else {
      setError(result.error || "")
    }
  };

  return (
    // Outer container fills the screen and centers the content on Web
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isDesktop && { paddingBottom: 40 }]}
      >

        {/* THE EXTENDED SURFACE CONTAINER */}
        <View style={[
          styles.contentWrapper,
          { width: maxWidth },
          isDesktop && {
            backgroundColor: theme.colors.surface,
            marginTop: 40,
            borderRadius: 24,
            ...theme.shadows.card,
            overflow: 'hidden'
          }
        ]}>

          {/* 1. BRANDING HEADER */}
          <View style={[
            styles.header,
            { backgroundColor: theme.colors.primary },
            isDesktop && { paddingTop: 40 } // Less top padding on web since there's no mobile status bar
          ]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="business" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.headerTitle}>{initialCompanyData.name}</Text>
            <Text style={styles.headerSubtitle}>Partener Business</Text>
          </View>

          <View style={[styles.content, isDesktop && { padding: 30 }]}>

            {/* 2. DATE COMPANIE */}
            <View style={[
              styles.card,
              // If the main wrapper is 'surface' on desktop, we make this 'background' so it contrasts nicely
              { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }
            ]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.colors.text.main }]}>Date Companie</Text>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(true)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <Ionicons name="create-outline" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                  <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Editează</Text>
                </TouchableOpacity>
              </View>
              <EditCompanyModal
                visible={isEditModalVisible}
                onClose={() => setIsEditModalVisible(false)}
                initialData={initialCompanyData}
                onSave={handleSaveChanges}
                isClosable = {isClosable}
                error = {error}
              />
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.text.muted }]}>Administrator:</Text>
                <Text style={[styles.value, { color: theme.colors.text.main }]}>{initialCompanyData.admin}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.text.muted }]}>Email:</Text>
                <Text style={[styles.value, { color: theme.colors.text.main }]}>{initialCompanyData.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.text.muted }]}>Telefon:</Text>
                <Text style={[styles.value, { color: theme.colors.text.main }]}>{initialCompanyData.phone}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.colors.border.light }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.text.muted }]}>CUI:</Text>
                <Text style={[styles.value, { color: theme.colors.text.main }]}>{initialCompanyData.cui}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.colors.text.muted }]}>Nr. Reg. Com:</Text>
                <Text style={[styles.value, { color: theme.colors.text.main }]}>{initialCompanyData.regCom}</Text>
              </View>
            </View>

            {/* 3. LOCATIONS SECTION */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.cardTitle, { color: theme.colors.text.main }]}>
                Locațiile Tale ({locations.length})
              </Text>
            </View>

            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                activeOpacity={0.7}
                style={[
                  styles.locationCard,
                  {
                    backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface,
                    borderColor: theme.colors.border.light,
                    borderWidth: isDesktop ? 1 : 0
                  }
                ]}
                onPress={() => router.push({
                  pathname: "/(service)/(location)/[id]",
                  params: { id: loc.id, origin: 'profile' }
                })}
              >
                <View style={styles.locationInfo}>
                  <View style={[styles.iconBox, { backgroundColor: isDesktop ? theme.colors.surface : theme.colors.background }]}>
                    <Ionicons name="location" size={20} color={theme.colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.locationName, { color: theme.colors.text.main }]}>{loc.name}</Text>
                    <Text style={[styles.locationAddress, { color: theme.colors.text.muted }]}>{loc.address}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.placeholder} />
              </TouchableOpacity>
            ))}

            {/* ADD LOCATION BUTTON */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.addButton, { borderColor: theme.colors.primary, backgroundColor: isDesktop ? theme.colors.background : 'transparent' }]}
              onPress={() => router.navigate("/(service)/add-location")}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>Adaugă locație nouă</Text>
            </TouchableOpacity>

            {/* LOGOUT */}
            <TouchableOpacity activeOpacity={0.7} style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
              <Text style={[styles.logoutText, { color: theme.colors.error }]}>Deconectare</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContent: { alignItems: 'center' }, // This ensures the wrapper stays centered on wide screens
  contentWrapper: { flex: 1 },

  header: {
    alignItems: 'center',
    padding: 40,
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' } as any,
    })
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },

  content: { padding: 16 },

  card: { padding: 24, borderRadius: 16, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 16 },

  sectionHeader: { marginBottom: 16, paddingHorizontal: 4 },

  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12
  },
  locationInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  locationName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  locationAddress: { fontSize: 13 },

  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 12
  },
  addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },

  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 40
  },
  logoutText: { fontSize: 16, marginLeft: 8, fontWeight: '700' }
});