import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useBusiness } from '@/context/BusinessContext';
import { useServices } from '@/hooks/useServices';
import { useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import AddServiceModal from '@/components/Services/AddServiceModal'
import ServiceCard from '@/components/Services/ServiceCardComponent'
import { IService } from '@auto-hub/shared/types/serviceTypes';

export default function ServicesScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();
  const { locations } = useBusiness();
  const { id } = useLocalSearchParams();

  const [activeLocationId, setActiveLocationId] = useState<string | null>(() => {
    if (id) return id;
    if (locations.length > 0) return locations[0]._id;
    return null;
  });

  const { services, isLoading, addService, deleteService, updateService } = useServices(activeLocationId);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    // If we don't have an active ID yet but locations just finished loading
    if (!activeLocationId && locations.length > 0) {
      setActiveLocationId(id || locations[0]._id);
    }
  }, [locations, id]);

  const groupedServices = services?.reduce((acc, service) => {
    // If a service doesn't have a category, put it in 'Altele'
    const categoryName = service.category?.trim() || 'Altele';

    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  // Logic for responsive design
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800; // Only apply the "Box" look on wide screens
  const maxWidth = isDesktop ? 900 : '100%';

  const selectedLocation: ILocation = locations.find(loc => loc._id === activeLocationId) || null;

  return (
    // The very back layer of the app
    <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>

      {/* THE EXTENDED SURFACE CONTAINER */}
      <View style={[
        styles.contentWrapper,
        { width: maxWidth },
        isDesktop && {
          backgroundColor: theme.colors.surface,
          marginVertical: 40,      // Detach from the top/bottom of the browser
          borderRadius: 24,        // Give it smooth, large corners
          ...theme.shadows.card,   // Apply your custom theme box-shadow!
          overflow: 'hidden'       // Keeps child elements inside the rounded corners
        }
      ]}>

        {/* 1. MAIN HEADER */}
        <View style={[
          styles.mainHeader,
          // Remove the massive mobile status-bar padding if we are on desktop
          isDesktop && { paddingTop: 40 }
        ]}>
          <Text style={[styles.title, { color: theme.colors.text.main }]}>Servicii</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.muted }]}>
            Gestionează serviciile și prețurile per locație
          </Text>
        </View>

        {/* 2. LOCATION TABS */}
        {selectedLocation && <View style={styles.tabsContainer}>
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
                      // On Desktop, since the background is already "surface", make inactive tabs slightly different so they pop
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
        </View>}


        {/* 3. SERVICES LIST AREA */}
        {selectedLocation && <ScrollView style={styles.listScrollArea} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* LIST HEADER WITH THE ADD BUTTON */}
          <View style={styles.listHeader}>
            <View>
              <Text style={[styles.listTitle, { color: theme.colors.text.main }]}>Servicii Active</Text>
              <Text style={[styles.listSubtitle, { color: theme.colors.primary }]}>{selectedLocation.name}</Text>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
              onPress={() => setAddModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adaugă</Text>
            </TouchableOpacity>
          </View>

          {/* Empty State / Cards go here */}

          <View style={{ width: '100%', paddingHorizontal: 30, paddingBottom: 40 }}>
            {Object.keys(groupedServices).length > 0 ? (
              Object.entries(groupedServices).map(([category, categoryServices]) => (
                <View key={category} style={{ marginBottom: 24 }}>

                  {/* CATEGORY HEADER */}
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: theme.colors.text.muted,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 12,
                    marginLeft: 4
                  }}>
                    {category}
                  </Text>

                  {/* SERVICES IN THIS CATEGORY */}
                  {categoryServices.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      onEdit={(svc) => {
                        setEditingService(svc); // 1. Save the service data to state
                        setAddModalVisible(true); // 2. Open the modal
                      }}
                      onDelete={(id) => {
                        deleteService(id);
                      }}
                    />
                  ))}
                </View>
              ))
            ) : (
              /* Empty State */
              <View style={[
                styles.emptyState,
                { borderColor: theme.colors.border.light, backgroundColor: isDesktop ? theme.colors.background : 'transparent' }
              ]}>
                <Ionicons name="briefcase-outline" size={40} color={theme.colors.text.placeholder} />
                <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
                  Nu ai niciun serviciu adăugat pentru {selectedLocation.name}.
                </Text>
              </View>
            )}
          </View>


        </ScrollView>}

      </View>

      {selectedLocation &&
        <AddServiceModal
          visible={isAddModalVisible}
          onClose={() => {
            setAddModalVisible(false);
            setEditingService(null); // IMPORTANT: Clear the state when closing so it doesn't get stuck in edit mode!
          }}
          categories={selectedLocation?.services || []}
          serviceToEdit={editingService} // <-- Pass the selected service here
          onSave={async (serviceData) => {
            if (editingService) {
              // We are in EDIT mode
              const result = await updateService(editingService._id, serviceData);
              if (result.success) {
                setAddModalVisible(false);
                setEditingService(null);
              } else {
                console.log(result.error);
              }
            } else {
              // We are in ADD mode
              const result = await addService(serviceData);
              if (result.success) {
                setAddModalVisible(false);
              } else {
                console.log(result.error);
              }
            }
          }}
        />}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center' },
  contentWrapper: { flex: 1 },

  mainHeader: {
    paddingHorizontal: 30, // Slightly wider padding for a spacious feel
    paddingTop: Platform.OS === 'android' ? 60 : 40,
    paddingBottom: 24,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, marginTop: 6, opacity: 0.8 },

  tabsContainer: { paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
  tabsScrollContent: { paddingHorizontal: 30, gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  tabText: { fontSize: 14 },

  listScrollArea: { flex: 1 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 16,
  },
  listTitle: { fontSize: 18, fontWeight: '700' },
  listSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 6, fontSize: 14 },

  emptyState: { marginTop: 10, alignItems: 'center', padding: 40, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
  emptyText: { marginTop: 12, textAlign: 'center', lineHeight: 20 }
});