import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesScreen() {
  const theme = useTheme<any>();
  const { width } = useWindowDimensions();
  
  // Logic for responsive design
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 800; // Only apply the "Box" look on wide screens
  const maxWidth = isDesktop ? 900 : '100%';

  const locations = [
    { id: 'loc1', name: 'Service Centru' },
    { id: 'loc2', name: 'Vulcanizare Nord' },
    { id: 'loc3', name: 'Garaj Vest' },
  ];

  const [activeLocationId, setActiveLocationId] = useState(locations[0].id);
  const activeLocationName = locations.find(loc => loc.id === activeLocationId)?.name;

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
        </View>

        {/* 3. SERVICES LIST AREA */}
        <ScrollView style={styles.listScrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
           
           {/* LIST HEADER WITH THE ADD BUTTON */}
           <View style={styles.listHeader}>
             <View>
                <Text style={[styles.listTitle, { color: theme.colors.text.main }]}>Servicii Active</Text>
                <Text style={[styles.listSubtitle, { color: theme.colors.primary }]}>{activeLocationName}</Text>
             </View>
             
             <TouchableOpacity 
               style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
               activeOpacity={0.8}
             >
               <Ionicons name="add" size={18} color="#FFFFFF" />
               <Text style={styles.addButtonText}>Adaugă</Text>
             </TouchableOpacity>
           </View>

           {/* Empty State / Cards go here */}
           <View style={[
             styles.emptyState, 
             { borderColor: theme.colors.border.light, backgroundColor: isDesktop ? theme.colors.background : 'transparent' }
           ]}>
              <Ionicons name="briefcase-outline" size={40} color={theme.colors.text.placeholder} />
              <Text style={[styles.emptyText, { color: theme.colors.text.muted }]}>
                 Nu ai niciun serviciu adăugat pentru {activeLocationName}.
              </Text>
           </View>
           
        </ScrollView>

      </View>
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
  
  emptyState: { marginHorizontal: 30, marginTop: 10, alignItems: 'center', padding: 40, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
  emptyText: { marginTop: 12, textAlign: 'center', lineHeight: 20 }
});