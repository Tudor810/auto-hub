import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    useWindowDimensions,
    StatusBar,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from "../../../components/Client/Map/Map";
import { useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useAllLocations } from '@/hooks/useAllLocations';
import * as Location from 'expo-location'
import { useRouter } from 'expo-router';
export default function MapScreen() {


    const { allLocations, isLoading, error } = useAllLocations();
    const mapRef = useRef<any>(null); // 1. Add a ref for the Map
    const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const router = useRouter();

    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toate');


    // 2. The GPS Logic
    useEffect(() => {
        (async () => {
            // Ask for permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            // Get the actual GPS coordinates
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    // 3. The function to fly the map to the user
    const handleLocateMe = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05, // Zoom level
                longitudeDelta: 0.05,
            }, 1000); // 1000ms animation duration
        } else {
            alert("Așteptăm semnalul GPS...");
        }
    };

    const filteredLocations = useMemo(() => {
        // Safety check: if data isn't loaded yet, return an empty array
        if (!allLocations) return [];

        return allLocations.filter((loc) => {
            // A. Check Category


            const matchesCategory =
                activeFilter === 'Toate' ||
                (loc.services && loc.services.includes(activeFilter));

            // B. Check Search (Make it case-insensitive!)
            const safeSearch = searchQuery.toLowerCase().trim();
            const matchesSearch =
                safeSearch === '' ||
                loc.name.toLowerCase().includes(safeSearch) ||
                loc.address.toLowerCase().includes(safeSearch); // Bonus: lets them search by street name!

            // Keep the location ONLY if it matches both the category AND the search
            return matchesCategory && matchesSearch;
        });
    }, [allLocations, activeFilter, searchQuery]); // Only re-run if one of these 3 things changes


    const theme = useTheme<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { id } = useLocalSearchParams();

    // --- Responsive Layout Logic ---
    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;

    // NEW: Condition for two rows
    const isTwoRows = isDesktop && width < 1200;


    const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null);
    const scrollViewRef = useRef<any>(null);

    useEffect(() => {
        setActiveFilter(id as string || "Toate");
    }, [id])

    const filters = [
        { id: 'Toate', icon: 'search-outline' },
        { id: 'Service', icon: 'build-outline' },
        { id: 'ITP', icon: 'document-outline' },
        { id: 'RCA', icon: 'document-text-outline' },
        { id: 'Vulcanizare', icon: 'disc-outline' },
        { id: 'Detailing', icon: 'sparkles-outline' },
        { id: 'Școală Șoferi', icon: 'school-outline' },
        { id: 'Redobândire', icon: 'refresh-outline' },
        { id: 'Piese Auto', icon: 'cart-outline' },
        { id: 'Tractări', icon: 'car-sport-outline' }
    ];

    const initialRegion = {
        latitude: 46.770439,
        longitude: 23.591423,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    if (isLoading) return <Text>Se încarcă harta...</Text>;
    if (error) return <Text>Eroare: {error}</Text>;
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* FULL SCREEN MAP WRAPPER */}
            <View style={styles.contentWrapper}>

                {/* MAP BACKGROUND */}
                <MapView
                    ref={mapRef} // <--- Attach the ref here
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={initialRegion}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    onPress={() => setSelectedLocation(null)}
                >
                    {/* 1. THE BUSINESS LOCATIONS */}
                    {filteredLocations.map((loc: ILocation) => (
                        <Marker
                            key={loc._id}
                            coordinate={{
                                latitude: parseFloat(loc.coordinates.latitude),
                                longitude: parseFloat(loc.coordinates.longitude)
                            }}
                            onPress={(e) => {
                                e?.stopPropagation?.();
                                setSelectedLocation(loc);
                            }}
                        >
                            {/* --- YOUR EXISTING CUSTOM PIN --- */}
                            <View style={[styles.markerContainer, { backgroundColor: theme.colors.primary }]}>
                                <View style={styles.markerInner}>
                                    <View style={[styles.markerCore, { backgroundColor: theme.colors.primary }]} />
                                </View>
                            </View>
                        </Marker>
                    ))}
                    {userLocation && (
                        <Marker
                            coordinate={{
                                latitude: userLocation.latitude,   // Access the lat property
                                longitude: userLocation.longitude  // Access the lng property
                            }}
                            anchor={{ x: 0.5, y: 0.5 }}
                            title="Locația ta" // Shows a nice tooltip on web hover
                            zIndex={10} // Ensures the user marker stays on top of business markers
                        >
                            {/* Custom "You are here" UI (Blue dot with a light halo) */}
                            <View style={styles.userMarkerHalo}>
                                <View style={styles.userMarkerCore} />
                            </View>
                        </Marker>
                    )}

                </MapView>

                {/* FLOATING TOP OVERLAY (Search & Filters) */}
                <View style={[
                    styles.floatingHeader,
                    { paddingTop: isDesktop ? 30 : insets.top + 10 }
                ]}>

                    {/* Inner wrapper to keep the search/filters from stretching too wide on desktop */}
                    <View style={[
                        styles.floatingHeaderInner,
                        // Add this dynamic style array to constrain the width for both!
                        { maxWidth: isTwoRows ? 700 : 1200 }
                    ]}>

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
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={[
                                    styles.filtersScrollContent,
                                    isTwoRows && {
                                        flexDirection: 'column',
                                        flexWrap: 'wrap',
                                        alignContent: 'center', // <--- Centers the wrapped columns horizontally
                                        flexGrow: 1,            // <--- Forces container to fill the screen width
                                        height: 84,
                                        paddingBottom: 0,
                                        paddingRight: 16,       // <--- Matches paddingHorizontal: 16 to keep it perfectly balanced
                                    }
                                ]}
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
                    onPress={handleLocateMe}
                >
                    <Ionicons name="locate" size={24} color={theme.colors.text.main} />
                </TouchableOpacity>

            </View>

            {/* BOTTOM INFO CARD */}
            {selectedLocation && (
                <View style={styles.bottomCardWrapper}>
                    <View style={[styles.locationCard, { backgroundColor: theme.colors.surface }]}>

                        {/* Close Button (X) */}
                        <TouchableOpacity
                            style={[styles.closeCardBtn, { backgroundColor: theme.colors.background }]}
                            onPress={() => setSelectedLocation(null)}
                        >
                            <Ionicons name="close" size={20} color={theme.colors.text.main} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push(`/(client)/(location)/${selectedLocation._id}`)}>
                            <View style={styles.cardContent}>
                                {/* Image Placeholder (Or real image if you have one) */}
                                <View style={[styles.cardImagePlaceholder, { backgroundColor: theme.colors.background }]}>
                                    <Ionicons name="business" size={32} color={theme.colors.text.muted} />
                                </View>

                                {/* Location Details */}
                                <View style={styles.cardInfo}>

                                    {/* Title & Verified Badge */}
                                    <View style={styles.cardTitleRow}>
                                        <Text style={[styles.cardTitle, { color: theme.colors.text.main }]} numberOfLines={1}>
                                            {selectedLocation.name}
                                        </Text>
                                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                    </View>

                                    {/* Ratings & Distance */}
                                    <View style={styles.cardSubRow}>
                                        <Ionicons name="star" size={14} color="#FBBF24" />
                                        <Text style={[styles.cardRating, { color: theme.colors.text.main }]}>4.8</Text>
                                        <Text style={styles.cardReviews}>(156)</Text>
                                        <Ionicons name="location-outline" size={14} color={theme.colors.text.muted} style={{ marginLeft: 8 }} />
                                        <Text style={styles.cardDistance}>4.0km</Text>
                                    </View>

                                    {/* Address */}
                                    <Text style={[styles.cardAddress, { color: theme.colors.text.muted }]} numberOfLines={1}>
                                        {selectedLocation.address}
                                    </Text>

                                    {/* Service Tags */}
                                    <View style={styles.cardTagsRow}>
                                        {selectedLocation.services?.slice(0, 3).map((tag, index) => (
                                            <View key={index} style={[styles.cardTag, { backgroundColor: theme.colors.background }]}>
                                                <Text style={[styles.cardTagText, { color: theme.colors.text.main }]}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>

                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

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
        maxWidth: 1200, // Prevents stretching on ultrawide monitors
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
        justifyContent: 'center',
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
    },
    // --- BOTTOM INFO CARD STYLES ---
    bottomCardWrapper: {
        position: 'absolute',
        bottom: 20, // Sit right above the tab bar
        left: 16,
        right: 16,
        alignItems: 'center',
        zIndex: 20,
    },
    locationCard: {
        width: '100%',
        maxWidth: 500, // Keeps it from stretching too wide on iPads/Desktop
        borderRadius: 20,
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 8 },
            web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' } as any,
        }),
    },
    closeCardBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        paddingRight: 24, // Leave space for the close button
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginRight: 4,
    },
    cardSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardRating: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    cardReviews: {
        fontSize: 13,
        color: '#9CA3AF',
        marginLeft: 4,
    },
    cardDistance: {
        fontSize: 13,
        color: '#9CA3AF',
        marginLeft: 2,
    },
    cardAddress: {
        fontSize: 13,
        marginBottom: 8,
    },
    cardTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    cardTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    cardTagText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'lowercase',
    },
    // --- USER LOCATION MARKER ---
    userMarkerHalo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.25)', // Soft blue transparent halo
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMarkerCore: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3B82F6', // Solid blue center
        borderWidth: 2.5,
        borderColor: '#FFFFFF', // White ring around the blue center
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
            android: { elevation: 4 },
            web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.3)' } as any,
        }),
    },
});