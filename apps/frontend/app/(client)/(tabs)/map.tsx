import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    useWindowDimensions,
    StatusBar
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from "../../../components/Client/Map/Map";

export default function MapScreen() {
    const theme = useTheme<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    // --- Responsive Layout Logic ---
    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    
    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toate');
    const scrollViewRef = useRef<any>(null);

    const filters = [
        { id: 'Toate', icon: 'search-outline' },
        { id: 'Service', icon: 'build-outline' },
        { id: 'ITP', icon: 'document-outline' },
        { id: 'Vulcanizare', icon: 'disc-outline' },
        { id: 'Detailing', icon: 'sparkles-outline'},
        { id: 'Școală Șoferi', icon: 'school-outline'},
        { id: 'Redobândire', icon: 'refresh-outline'},
        { id: 'Piese Auto', icon: 'cart-outline'},
        { id: 'Tractări', icon: 'car-sport-outline'}
    ];

    const initialRegion = {
        latitude: 46.770439, 
        longitude: 23.591423,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* FULL SCREEN MAP WRAPPER */}
            <View style={styles.contentWrapper}>

                {/* MAP BACKGROUND */}
                <MapView
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={initialRegion}
                    showsUserLocation={true}
                    showsMyLocationButton={false} 
                >
                    <Marker coordinate={{ latitude: 46.770439, longitude: 23.591423 }}>
                        <View style={[styles.markerContainer, { backgroundColor: theme.colors.primary }]}>
                            <View style={styles.markerInner}>
                                <View style={[styles.markerCore, { backgroundColor: theme.colors.primary }]} />
                            </View>
                        </View>
                    </Marker>
                </MapView>

                {/* FLOATING TOP OVERLAY (Search & Filters) */}
                <View style={[
                    styles.floatingHeader,
                    { paddingTop: isDesktop ? 30 : insets.top + 10 }
                ]}>
                    
                    {/* Inner wrapper to keep the search/filters from stretching too wide on desktop */}
                    <View style={styles.floatingHeaderInner}>
                        
                        {/* Search Bar Row */}
                        <View style={styles.searchRow}>
                            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
                                <Ionicons name="search" size={20} color={theme.colors.text.muted} style={styles.searchIcon} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.colors.text.main }]}
                                    placeholder="Caută service-uri..."
                                    placeholderTextColor={theme.colors.text.placeholder || '#9CA3AF'}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            <TouchableOpacity style={[styles.listButton, { backgroundColor: theme.colors.surface }]} activeOpacity={0.8}>
                                <Ionicons name="list" size={22} color={theme.colors.text.main} />
                            </TouchableOpacity>
                        </View>

                        {/* Filter Pills ScrollView */}
                        <View 
                            style={{ width: '100%' }}
                            // The magic scroll trick stays so it works on smaller laptops!
                            {...(Platform.OS === 'web' ? {
                                onWheel: (e: any) => {
                                    if (scrollViewRef.current) {
                                        const node = scrollViewRef.current.getScrollableNode();
                                        if (node) {
                                            node.scrollLeft += e.deltaY;
                                        }
                                    }
                                }
                            } : {})}
                        >
                            <ScrollView
                                ref={scrollViewRef}
                                horizontal
                                showsHorizontalScrollIndicator={false} // <--- Set this permanently to false
                                contentContainerStyle={styles.filtersScrollContent}
                            >
                                {filters.map((filter) => {
                                    const isActive = activeFilter === filter.id;
                                    return (
                                        <TouchableOpacity
                                            key={filter.id}
                                            activeOpacity={0.8}
                                            onPress={() => setActiveFilter(filter.id)}
                                            style={[
                                                styles.filterPill,
                                                { backgroundColor: isActive ? theme.colors.primary : theme.colors.surface }
                                            ]}
                                        >
                                            {filter.icon && (
                                                <Ionicons
                                                    name={filter.icon as any}
                                                    size={16}
                                                    color={isActive ? '#FFFFFF' : theme.colors.text.main}
                                                    style={styles.filterIcon}
                                                />
                                            )}
                                            <Text style={[
                                                styles.filterText,
                                                { color: isActive ? '#FFFFFF' : theme.colors.text.main }
                                            ]}>
                                                {filter.id}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                </View>

                {/* FLOATING ACTION BUTTON (Locate Me) */}
                <TouchableOpacity
                    style={[styles.fabLocate, { backgroundColor: theme.colors.surface }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name="locate" size={24} color={theme.colors.text.main} />
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 10,
        alignItems: 'center', // Centers the inner container on desktop
        pointerEvents: 'box-none', // Ensures clicks pass through the invisible parts of the header to the map below
    },
    floatingHeaderInner: {
        width: '100%',
        maxWidth: 1100, // Prevents stretching on ultrawide monitors
    },
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 14,
        elevation: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
            web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' } as any,
        }),
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        ...Platform.select({
            web: { outlineStyle: 'none' } as any,
        }),
    },
    listButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
            web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' } as any,
        }),
    },
    filtersScrollContent: {
        paddingHorizontal: 16,
        paddingRight: 24, // Breathing room at the very end of the scroll
        gap: 8,
        paddingBottom: 12, 
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 3,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
            web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' } as any,
        }),
    },
    filterIcon: {
        marginRight: 6,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    fabLocate: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
            web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.15)' } as any,
        }),
    },
    markerContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    markerInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerCore: {
        width: 12,
        height: 12,
        borderRadius: 6,
    }
});