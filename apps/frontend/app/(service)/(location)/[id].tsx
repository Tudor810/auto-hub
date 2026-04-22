import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, Alert } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ILocation } from '@auto-hub/shared/types/locationTypes';
import { useBusiness } from '@/context/BusinessContext';
import ErrorMessage from '@/components/ErrorMessage';

export default function LocationDetailsScreen({ }) {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const { id, origin } = useLocalSearchParams();

    const { locations, company, deleteLocationData} = useBusiness();

    const location: ILocation = locations.find(loc => loc._id === id);

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 800 : '100%';
    const [error, setError] = useState("");

    const dayMap = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'];
    const todayKey = dayMap[new Date().getDay()];

    const executeDelete = async () => {
        try {
            // Assuming your context handles the fetch to your new backend endpoint
            const response = await deleteLocationData(location._id);

            if (response.success) {
                // Navigate back to wherever they came from
                if (origin === "profile") {
                    router.navigate('/(service)/profile');
                } else {
                    router.navigate('/(service)/dashboard');
                }
            } else {
                // Handle backend error (you could use your Snackbar here instead of alert)
                setError(response.error || "Eroare la ștergerea locației.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            setError("A apărut o eroare de rețea.");
        }
    };

    // The Cross-Platform Confirmation Handler
    const handleDeleteLocation = () => {
        const title = "Șterge Locația";
        const message = "Ești sigur că vrei să ștergi această locație? Toate programările și datele asociate vor fi pierdute definitiv.";

        if (isWeb) {
            // Web fallback using standard browser confirmation
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed) {
                executeDelete();
            }
        } else {
            // Native iOS/Android Alert
            Alert.alert(
                title,
                message,
                [
                    { text: "Anulează", style: "cancel" },
                    { 
                        text: "Șterge", 
                        style: "destructive", // Makes the button red on iOS!
                        onPress: executeDelete 
                    }
                ],
                { cancelable: true }
            );
        }
    };

    
    if (!location) {
        // Return null (or an empty View) so it doesn't try to read 'schedule' of undefined
        return null; 
    }

    const todaysSchedule = location.schedule?.[todayKey];

    // Format the display string
    const scheduleText = todaysSchedule?.isOpen
        ? `Astăzi: ${todaysSchedule.open} - ${todaysSchedule.close}`
        : 'Astăzi: Închis';


    return (
        // 1. Am adăugat contentContainerStyle={{ flexGrow: 1 }}
        <ScrollView
            style={{ backgroundColor: theme.colors.background }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            {/* 2. Am adăugat flex: 1 aici */}
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={[
                    styles.contentWrapper,
                    { width: maxWidth },
                    isDesktop && { backgroundColor: theme.colors.surface, marginVertical: 40, borderRadius: 24, padding: 32, ...theme.shadows.card }
                ]}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => origin === "profile" ? router.navigate('/(service)/profile') : router.navigate('/(service)/dashboard')} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text.main} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.title, { color: theme.colors.text.main }]}>{location.name}</Text>
                            <Text style={{ color: theme.colors.text.muted, marginTop: 4 }}>Gestionare locație</Text>
                        </View>
                    </View>

                    {/* CARD 1: INFORMAȚII */}
                    <View style={[styles.card, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }]}>

                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text.main }]}>Informații Publice</Text>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    router.push({
                                        pathname: '/(service)/add-location',
                                        params : {id: location._id, origin: 'location'}
                                    });
                                }}
                            >
                                <Ionicons name="create-outline" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
                                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Editează</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ADDRESS */}
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={theme.colors.text.muted} />
                            <Text style={[styles.infoText, { color: theme.colors.text.main }]}>
                                {location.address}
                            </Text>
                        </View>

                        {/* PHONE (From Company) */}
                        {company?.phone && (
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={20} color={theme.colors.text.muted} />
                                <Text style={[styles.infoText, { color: theme.colors.text.main }]}>
                                    {company.phone}
                                </Text>
                            </View>
                        )}

                        {/* TODAY'S SCHEDULE */}
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color={theme.colors.text.muted} />
                            <Text style={[
                                styles.infoText,
                                { color: todaysSchedule?.isOpen ? theme.colors.text.main : theme.colors.error } // Red if closed
                            ]}>
                                {scheduleText}
                            </Text>
                        </View>

                        {/* DESCRIPTION (Optional, so we check if it exists) */}
                        {location.description ? (
                            <View style={[styles.infoRow, { alignItems: 'flex-start', marginTop: 8 }]}>
                                <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.muted} style={{ marginTop: 2 }} />
                                <Text style={[styles.infoText, { color: theme.colors.text.main, flex: 1, lineHeight: 20 }]}>
                                    {location.description}
                                </Text>
                            </View>
                        ) : null}

                    </View>
                    {/* CARD 2: SCURTĂTURI */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.main }]}>Acțiuni Rapide</Text>
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/(service)/(tabs)/calendar",
                                    params: { id: location._id }
                                })}
                            style={[styles.actionBtn, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }]}>

                            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="calendar" size={24} color="#3B82F6" />
                            </View>
                            <Text style={[styles.actionText, { color: theme.colors.text.main }]}>Calendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/(service)/(tabs)/services",
                                    params: { id: location._id }
                                })}
                            style={[styles.actionBtn, { backgroundColor: isDesktop ? theme.colors.background : theme.colors.surface }]}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="briefcase" size={24} color="#10B981" />
                            </View>
                            <Text style={[styles.actionText, { color: theme.colors.text.main }]}>Servicii</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 3. SPACER MAGICA - Acest View gol împinge automat restul conținutului în jos */}
                    <View style={{ flex: 1, minHeight: 40 }} />

                    {/* DANGER ZONE (Acum va sta mereu jos de tot) */}
                    <View style={styles.dangerZone}>
                        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteLocation}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                            <Text style={[styles.dangerText, { color: theme.colors.error }]}>Șterge această locație</Text>
                        </TouchableOpacity>
                    </View>
                    {error ? <ErrorMessage message={error}/> : null}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // Am adăugat flex: 1 la contentWrapper pentru a-i permite să se întindă pe tot ecranul
    contentWrapper: { flex: 1, padding: 20 },

    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingTop: Platform.OS === 'android' ? 40 : 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    title: { fontSize: 24, fontWeight: '800' },

    card: { padding: 20, borderRadius: 16, marginBottom: 32 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoText: { fontSize: 15, marginLeft: 12, fontWeight: '500' },

    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, marginLeft: 4 },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(150,150,150,0.1)' },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionText: { fontSize: 14, fontWeight: '600' },

    // Am scos marginTop-ul masiv de aici, fiindcă se ocupă Spacer-ul de el
    dangerZone: { borderTopWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', paddingTop: 24, paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.05)' },
    dangerText: { fontSize: 15, fontWeight: '700', marginLeft: 8 }
});