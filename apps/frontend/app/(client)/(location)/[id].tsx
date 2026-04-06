import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,
    Image,
    Linking,
    ActivityIndicator
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllLocations } from '@/hooks/useAllLocations';
import { useServices } from '@/hooks/useServices';

export default function LocationDetailsScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { allLocations, isLoading } = useAllLocations();
    const { id } = useLocalSearchParams();
    const { services } = useServices(id as string);
    const styles = makeStyles(theme, insets);

    // --- SELECTION LOGIC ---
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

    const toggleService = (service: any) => {
        setSelectedServices(prev => {
            const isAlreadySelected = prev.some(s => s._id === service._id);
            if (isAlreadySelected) {
                return prev.filter(s => s._id !== service._id); // Remove it
            } else {
                return [...prev, service]; // Add it
            }
        });
    };

    const totalPrice = selectedServices.reduce((sum, service) => {
        const numericPrice = parseFloat(service.price?.toString().replace(/[^0-9.]/g, '')) || 0;
        return sum + numericPrice;
    }, 0);

    const locationData = allLocations?.filter(loc => loc._id === id)[0];
    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 800 : '100%';

    const handleOpenMaps = () => {
        const lat = locationData?.coordinates?.latitude;
        const lng = locationData?.coordinates?.longitude;

        // Encode the name so spaces and special characters don't break the URL
        const label = encodeURIComponent(locationData?.name || "Locație");

        if (!lat || !lng) return;

        const latLng = `${lat},${lng}`;

        // Magically select the right URL format based on the user's device!
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latLng}`,
            android: `geo:0,0?q=${latLng}(${label})`,
            web: `https://www.google.com/maps/search/?api=1&query=${latLng}`
        });

        if (url) {
            // openURL works on the web too—it just opens a new browser tab!
            Linking.openURL(url);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 10, color: theme.colors.text.main }}>Se încarcă detaliile...</Text>
            </View>
        );
    }

    if (!locationData) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    // Add enough padding so the sticky bar doesn't cover the last item
                    { paddingBottom: selectedServices.length > 0 ? 120 : 40 },
                    isDesktop && { paddingBottom: selectedServices.length > 0 ? 120 : 40 }
                ]}
            >
                <View style={[
                    styles.desktopWrapper,
                    { width: maxWidth },
                    isDesktop && { marginTop: 40, borderRadius: theme.borderRadius.card, overflow: 'hidden', ...theme.shadows.card }
                ]}>

                    {/* --- HERO SECTION --- */}
                    <View style={styles.heroContainer}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1000&auto=format&fit=crop' }} style={styles.heroImage} />
                        <View style={styles.heroOverlay} />

                        <TouchableOpacity style={[styles.backButton, { top: Math.max(insets.top + 16, 16) }]} onPress={() => router.back()} activeOpacity={0.8}>
                            <Ionicons name="arrow-back" size={24} color={"#F9FAFB"} />
                        </TouchableOpacity>

                        <View style={styles.heroTextContainer}>
                            <View style={styles.verifiedRow}>
                                <Text style={[styles.heroTitle, { color: "#F9FAFB" }]} numberOfLines={2}>{locationData.name}</Text>
                                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} style={{ marginLeft: 8, marginTop: 4 }} />
                            </View>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={18} color="#FBBF24" />
                                <Text style={[styles.heroRating, { color: "#F9FAFB" }]}>{locationData.rating?.toString() || "5"}</Text>
                                <Text style={[styles.heroReviews, { color: "#F9FAFB", opacity: 0.8 }]}>({locationData.reviews?.toString() || '0'} recenzii)</Text>
                            </View>
                        </View>
                    </View>

                    {/* --- MAIN CONTENT --- */}
                    <View style={[styles.contentContainer, { backgroundColor: theme.colors.background }]}>

                        {/* 1. CONTACT & SCHEDULE CARD */}
                        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}><Ionicons name="location-outline" size={22} color={theme.colors.text.main} /></View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={[styles.infoMainText, { color: theme.colors.text.main }]}>{locationData.address}</Text>
                                    <TouchableOpacity onPress={handleOpenMaps} activeOpacity={0.7}><Text style={[styles.linkText, { color: theme.colors.primary }]}>Deschide în Google Maps <Ionicons name="open-outline" size={14} /></Text></TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}><Ionicons name="call-outline" size={22} color={theme.colors.text.main} /></View>
                                <View style={styles.infoTextContainer}><Text style={[styles.infoMainText, { color: theme.colors.text.main }]}>{locationData.phone || "No phone added"}</Text></View>
                            </View>
                            <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                                <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}><Ionicons name="time-outline" size={22} color={theme.colors.text.main} /></View>
                                <View style={styles.infoTextContainer}>
                                    {locationData.schedule && Object.entries(locationData.schedule).map(([day, info]: any) => {
                                        const hoursText = info.isOpen ? `${info.open} - ${info.close}` : 'Închis';
                                        return (
                                            <View key={day} style={styles.scheduleRow}>
                                                <Text style={[styles.scheduleDay, { color: !info.isOpen ? theme.colors.text.muted : theme.colors.text.main }]}>{day}</Text>
                                                <Text style={[styles.scheduleHours, { color: theme.colors.text.main, fontWeight: !info.isOpen ? '700' : '500' }]}>{hoursText}</Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* 2. ABOUT US CARD */}
                        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Despre noi</Text>
                            <Text style={[styles.aboutText, { color: theme.colors.text.muted }]}>{locationData.description}</Text>
                        </View>

                        {/* 3. SERVICES MENU */}
                        <View style={styles.servicesHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text.main, marginBottom: 0 }]}>Meniu servicii</Text>
                        </View>
                        <Text style={[styles.categorySubtitle, { color: theme.colors.text.muted }]}>CURSURI</Text>

                        <View style={styles.servicesContainer}>
                            {services && services.length > 0 ? (
                                services.map((service) => {
                                    const isSelected = selectedServices.some(s => s._id === service._id);

                                    return (
                                        <TouchableOpacity
                                            key={service._id}
                                            activeOpacity={0.8}
                                            onPress={() => toggleService(service)}
                                            style={[
                                                styles.serviceCard,
                                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.light },
                                                isSelected && { borderColor: theme.colors.primary, borderWidth: 1.5 }
                                            ]}
                                        >
                                            {/* TOP ROW: TITLE & PRICE/BUTTON */}
                                            <View style={styles.serviceHeaderRow}>
                                                <Text style={[styles.serviceTitle, { color: theme.colors.text.main }]}>{service.name}</Text>

                                                <View style={styles.priceActionRow}>
                                                    <Text style={[styles.servicePrice, { color: theme.colors.text.main }]}>{service.price} RON</Text>
                                                    <View style={[
                                                        styles.addButton,
                                                        { backgroundColor: theme.colors.background }, // Unselected gray
                                                        isSelected && { backgroundColor: theme.colors.primary } // Selected blue
                                                    ]}>
                                                        <Ionicons
                                                            name={isSelected ? "remove" : "add"}
                                                            size={18}
                                                            color={isSelected ? "#F9FAFB" : theme.colors.text.muted}
                                                        />
                                                    </View>
                                                </View>
                                            </View>

                                            {/* BOTTOM ROWS: DESC & DURATION */}
                                            <Text style={[styles.serviceDesc, { color: theme.colors.text.muted }]}>{service.description}</Text>

                                            <View style={styles.durationRow}>
                                                <Ionicons name="time-outline" size={14} color={theme.colors.text.muted} />
                                                <Text style={[styles.durationText, { color: theme.colors.text.muted }]}>{service.duration || '60'} min</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={[styles.emptyServiceCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.light }]}>
                                    <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.background }]}><Ionicons name="construct-outline" size={32} color={theme.colors.text.muted} /></View>
                                    <Text style={[styles.emptyServiceTitle, { color: theme.colors.text.main }]}>Niciun serviciu disponibil</Text>
                                    <Text style={[styles.emptyServiceSub, { color: theme.colors.text.muted }]}>Această locație nu a adăugat încă o listă de servicii și prețuri.</Text>
                                </View>
                            )}
                        </View>

                    </View>
                </View>
            </ScrollView>

            {/* --- STICKY BOTTOM BAR --- */}
            {selectedServices.length > 0 && (
                <View style={[styles.bottomBarWrapper, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border.medium }]}>
                    {/* Inner container to constrain width on desktop exactly like the main wrapper */}
                    <View style={[styles.bottomBarInner, { maxWidth: maxWidth, paddingBottom: Math.max(insets?.bottom || 0, 16) }]}>

                        <View style={styles.bottomBarLeft}>
                            <Text style={[styles.selectedCountText, { color: theme.colors.text.muted }]}>
                                {selectedServices.length} {selectedServices.length === 1 ? 'serviciu selectat' : 'servicii selectate'}
                            </Text>
                            <Text style={[styles.totalPriceText, { color: theme.colors.text.main }]}>
                                {totalPrice} RON
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                            activeOpacity={0.8}
                            onPress={() => {

                                const serviceIdsString = selectedServices.map(s => s._id).join(',');

                                router.push({
                                    pathname: '/(client)/add-appointment',
                                    params: {
                                        locationId: id,
                                        serviceIds: serviceIdsString
                                    }
                                })
                            }}
                        >
                            <Ionicons name="cart-outline" size={20} color={"#F9FAFB"} style={{ marginRight: 8 }} />
                            <Text style={[styles.continueButtonText, { color: "#F9FAFB" }]}>Continuă</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            )}

        </View>
    );
}

const makeStyles = (theme: any, insets?: any) => StyleSheet.create({
    scrollContent: { flexGrow: 1, alignItems: 'center' },
    desktopWrapper: { flex: 1 },

    // --- HERO SECTION ---
    heroContainer: { height: 280, width: '100%', position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', backgroundColor: 'rgba(0,0,0,0.5)' },
    backButton: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    heroTextContainer: { position: 'absolute', bottom: 24, left: 20, right: 20 },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    heroTitle: { fontSize: 28, fontWeight: '800', flexShrink: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    heroRating: { fontSize: 16, fontWeight: '700', marginLeft: 6 },
    heroReviews: { fontSize: 15, marginLeft: 6 },

    contentContainer: { padding: 16, paddingTop: 24, gap: 16 },
    card: { borderRadius: theme.borderRadius.card, padding: 20, ...theme.shadows.card },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },

    // Info Rows
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    infoTextContainer: { flex: 1, justifyContent: 'center' },
    infoMainText: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
    linkText: { fontSize: 14, fontWeight: '600', marginTop: 4 },
    scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingRight: 10 },
    scheduleDay: { fontSize: 14 },
    scheduleHours: { fontSize: 14 },
    aboutText: { fontSize: 15, lineHeight: 24 },

    // --- NEW SERVICES DESIGN ---
    servicesHeader: { marginTop: 8 },
    categorySubtitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    servicesContainer: { gap: 12 },

    serviceCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        elevation: 0,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3 },
            web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.03)' } as any,
        }),
    },
    serviceHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    serviceTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        paddingRight: 12,
        lineHeight: 22,
    },
    priceActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '800',
        marginRight: 12,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationText: {
        fontSize: 13,
        marginLeft: 4,
    },

    emptyServiceCard: { padding: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    emptyIconBox: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyServiceTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    emptyServiceSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

    // --- STICKY BOTTOM BAR (CONSTRAINED) ---
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center', // Centers the inner bar on Desktop
        borderTopWidth: 1,
        ...theme.shadows.card,
        // Override shadow just for the top edge
        ...Platform.select({
            ios: { shadowOffset: { width: 0, height: -4 } },
            web: { boxShadow: '0px -4px 16px rgba(0,0,0,0.05)' } as any,
        }),
    },
    bottomBarInner: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        // paddingBottom is handled inline based on safe area insets
    },
    bottomBarLeft: {
        flex: 1,
    },
    selectedCountText: {
        fontSize: 13,
        marginBottom: 4,
    },
    totalPriceText: {
        fontSize: 24,
        fontWeight: '800',
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.button,
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: '700',
    }
});