import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    useWindowDimensions,
    Image
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useAllLocations } from '@/hooks/useAllLocations';
import { ServiceCategory } from '@auto-hub/shared/types/serviceTypes';

export default function ListScreen() {
    const theme = useTheme<any>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const { allLocations, isLoading, error } = useAllLocations();

    // --- State ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<ServiceCategory>('');

    // --- Responsive Logic ---
    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 800 : '100%';

    // Sync filter if passed via URL
    useEffect(() => {
        if (id && typeof id === 'string') {
            setActiveFilter(id as ServiceCategory);
        }
    }, [id]);

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

    // --- Filter Logic ---
    const filteredLocations = useMemo(() => {
        if (!allLocations) return [];

        return allLocations.filter((loc) => {
            const matchesCategory = activeFilter === 'Toate' || (loc.services && loc.services.includes(activeFilter));
            const safeSearch = searchQuery.toLowerCase().trim();
            const matchesSearch = safeSearch === '' ||
                loc.name.toLowerCase().includes(safeSearch) ||
                loc.address.toLowerCase().includes(safeSearch);

            return matchesCategory && matchesSearch;
        });
    }, [allLocations, activeFilter, searchQuery]);

    if (isLoading) return <View style={styles.centerScreen}><Text style={{ color: theme.colors.text.main }}>Se încarcă locațiile...</Text></View>;
    if (error) return <View style={styles.centerScreen}><Text style={{ color: theme.colors.error }}>Eroare: {error}</Text></View>;

    // --- Reusable Filter Pill Component ---
    const renderFilterPill = (filter: any) => {
        const isActive = activeFilter === filter.id;
        return (
            <TouchableOpacity
                key={filter.id}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter.id)}
                style={[
                    styles.filterPill,
                    { backgroundColor: isActive ? theme.colors.primary : (isDesktop ? theme.colors.background : theme.colors.surface) }
                ]}
            >
                {filter.icon ? (
                    <Ionicons
                        name={filter.icon as any}
                        size={16}
                        color={isActive ? '#FFFFFF' : theme.colors.text.main}
                        style={styles.filterIcon}
                    />
                ) : null}
                <Text style={[
                    styles.filterText,
                    { color: isActive ? '#FFFFFF' : theme.colors.text.main }
                ]}>
                    {filter.id}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, isDesktop && { paddingBottom: 40 }]}
            >
                {/* EXTENDED SURFACE CONTAINER */}
                <View style={[
                    styles.contentWrapper,
                    { width: maxWidth },
                    isDesktop ? {
                        backgroundColor: theme.colors.surface,
                        marginTop: 40,
                        borderRadius: 24,
                        paddingTop: 32,
                        ...Platform.select({
                            web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any,
                            default: { elevation: 4 }
                        }),
                        overflow: 'hidden'
                    } : {
                        paddingTop: Math.max(insets.top + 10, 16)
                    }
                ]}>

                    {/* --- HEADER: Search Bar & Map Button --- */}
                    <View style={styles.searchRow}>
                        <View style={[
                            styles.searchContainer,
                            { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }
                        ]}>
                            <Ionicons name="search" size={20} color={theme.colors.text.muted} style={styles.searchIcon} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.colors.text.main }]}
                                placeholder="Caută service-uri..."
                                placeholderTextColor={theme.colors.text.placeholder || '#9CA3AF'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.mapButton,
                                { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => router.push("/(client)/(tabs)/map")}
                        >
                            <Ionicons name="map-outline" size={22} color="#F59E0B" />
                        </TouchableOpacity>
                    </View>

                    {/* --- FILTERS (DYNAMIC WEB WRAPPING) --- */}
                    {isDesktop ? (
                        /* DESKTOP: Wrapped View so everything is visible (no scrolling) */
                        <View style={styles.desktopFiltersContainer}>
                            {filters.map(renderFilterPill)}
                        </View>
                    ) : (
                        /* MOBILE: Horizontal ScrollView for touch swiping */
                        <View style={styles.mobileFiltersWrapper}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.mobileFiltersScrollContent}
                            >
                                {filters.map(renderFilterPill)}
                            </ScrollView>
                        </View>
                    )}

                    {/* --- LIST OF LOCATIONS --- */}
                    <View style={styles.listContainer}>
                        {filteredLocations.length > 0 ? (
                            filteredLocations.map((loc: ILocation) => (
                                <TouchableOpacity
                                    key={loc._id}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.card,
                                        { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }
                                    ]}
                                    onPress={() => router.push(`/(client)/(location)/${loc._id}`)}
                                >
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?q=80&w=200&auto=format&fit=crop' }}
                                        style={styles.cardImage}
                                    />

                                    <View style={styles.cardInfo}>
                                        <View style={styles.cardHeaderRow}>
                                            <Text style={[styles.cardTitle, { color: theme.colors.text.main }]} numberOfLines={1}>
                                                {loc.name}
                                            </Text>
                                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                                        </View>

                                        <View style={styles.cardSubRow}>
                                            {!loc.rating || loc.rating === -1 ? <Text style={[{ color: theme.colors.text.muted, textAlign: 'center' }]}>Rating-ul nu este disponibil</Text> :
                                                <>
                                                    <Ionicons name="star" size={14} color="#FBBF24" />
                                                    <Text style={[styles.cardRating, { color: theme.colors.text.main }]}>{loc.rating}</Text>
                                                    <Text style={styles.cardReviews}>({loc.reviews})</Text>
                                                </>
                                            }
                                        
                                            <View style={styles.dotSeparator} />
                                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                                            <Text style={styles.cardDistance}>2.5km</Text>
                                        </View>

                                        <Text style={[styles.cardAddress, { color: theme.colors.text.muted }]} numberOfLines={1}>
                                            {loc.address}
                                        </Text>

                                        <View style={styles.cardTagsRow}>
                                            {loc.services?.slice(0, 3).map((tag, idx) => (
                                                <View key={idx} style={[styles.cardTag, { backgroundColor: isDesktop ? theme.colors.surface : theme.colors.background }]}>
                                                    <Text style={[styles.cardTagText, { color: theme.colors.text.secondary }]}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <Ionicons name="chevron-forward" size={20} color={theme.colors.border?.medium || '#D1D5DB'} style={styles.cardChevron} />
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="search" size={48} color={theme.colors.border?.medium || '#D1D5DB'} />
                                <Text style={[styles.emptyStateTitle, { color: theme.colors.text.main }]}>Nu am găsit rezultate</Text>
                                <Text style={[styles.emptyStateSub, { color: theme.colors.text.muted }]}>Încearcă alte filtre sau modifică termenul de căutare.</Text>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainContainer: { flex: 1 },
    scrollContent: { alignItems: 'center' },
    contentWrapper: { flex: 1, width: '100%' },

    // --- SEARCH ROW ---
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 14,
        elevation: 2,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
            web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' } as any,
        }),
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        ...Platform.select({ web: { outlineStyle: 'none' } as any }),
    },
    mapButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
            web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' } as any,
        }),
    },

    // --- FILTERS ---

    // Desktop layout: flexWrap makes them naturally fall to the next line
    desktopFiltersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Centers the pills nicely
        gap: 8,                   // Adds space between pills in all directions
        paddingHorizontal: 16,
        marginBottom: 20,
    },

    // Mobile layout: Standard horizontal ScrollView
    mobileFiltersWrapper: { marginBottom: 16 },
    mobileFiltersScrollContent: {
        paddingHorizontal: 16,
        paddingRight: 24,
        gap: 8,
        paddingBottom: 4,
    },

    // The Pill itself
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 38,
        paddingHorizontal: 16,
        borderRadius: 20,
        elevation: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
            web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)' } as any,
        }),
    },
    filterIcon: { marginRight: 6 },
    filterText: { fontSize: 14, fontWeight: '600' },

    // --- LIST & CARDS ---
    listContainer: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
            web: { boxShadow: '0px 4px 16px rgba(0,0,0,0.04)' } as any,
        }),
    },
    cardImage: {
        width: 84,
        height: 84,
        borderRadius: 12,
        backgroundColor: '#E5E7EB',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 6,
        flexShrink: 1,
    },
    cardSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardRating: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
    cardReviews: { fontSize: 13, color: '#9CA3AF', marginLeft: 4 },
    dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    cardDistance: { fontSize: 13, color: '#6B7280', marginLeft: 2 },
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
    cardChevron: {
        marginLeft: 8,
    },

    // --- EMPTY STATE ---
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
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
        paddingHorizontal: 32,
        lineHeight: 20,
    }
});