import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { useTheme, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// 🚨 Asigură-te că ruta către hook-ul tău este corectă
import { useInputProps } from '../../hooks/useInputProps';

// --- DATE CONSTANTE ---
const SERVICE_CATEGORIES = [
    'Service Auto', 'Stație ITP', 'Vulcanizare', 'Detailing / Spălătorie',
    'Tractări', 'Școală de Șoferi', 'Redobândire Permis', 'Piese Auto', 'Asigurări'
];

const DAYS_OF_WEEK = [
    { id: 'luni', label: 'Luni' }, { id: 'marti', label: 'Marți' }, { id: 'miercuri', label: 'Miercuri' },
    { id: 'joi', label: 'Joi' }, { id: 'vineri', label: 'Vineri' }, { id: 'sambata', label: 'Sâmbătă' }, { id: 'duminica', label: 'Duminică' }
];

export default function AddLocationScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const defaultInputProps = useInputProps();

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 600 : '100%'; // Mai îngust pentru formulare ca să arate premium

    const TIME_OPTIONS = Array.from({ length: 36 }).map((_, i) => {
        const hour = Math.floor(i / 2) + 6;
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    const [timePicker, setTimePicker] = useState<{ visible: boolean, dayId: string, type: 'open' | 'close' } | null>(null);

    const handleTimeSelect = (selectedTime: string) => {
        if (!timePicker) return;
        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [timePicker.dayId]: {
                    ...prev.schedule[timePicker.dayId],
                    [timePicker.type]: selectedTime
                }
            }
        }));
        setTimePicker(null); // Închidem modalul după selecție
    };
    // --- STAREA FORMULARULUI ---
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        address: '',
        latitude: '',
        longitude: '',
        description: '',
        services: [] as string[],
        schedule: DAYS_OF_WEEK.reduce((acc, day) => {
            acc[day.id] = { isOpen: day.id !== 'duminica', open: '08:00', close: '18:00' };
            return acc;
        }, {} as any)
    });

    // --- HANDLERS ---
    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            console.log('Salvare Locație:', formData);
            router.back(); // Sau router.replace către pagina locației create
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else {
            router.navigate("/(service)/profile");
        }  
    };

    const toggleService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const toggleDayStatus = (dayId: string) => {
        setFormData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, [dayId]: { ...prev.schedule[dayId], isOpen: !prev.schedule[dayId].isOpen } }
        }));
    };

    // --- RENDER PAȘI ---
    // --- RENDER PAȘI ---
    const renderStep1 = () => (
        <View style={styles.stepContainer}>

            {/* 1. Am izolat centrarea doar pentru Titlu și Icon */}
            <View style={styles.stepHeaderCentered}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="location-outline" size={32} color="#10B981" />
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Locație & Descriere</Text>
            </View>

            {/* 2. Input-urile stau acum la lățime completă (width: '100%'). FĂRĂ flex: 1 aici! */}
            <TextInput
                {...defaultInputProps}
                style={[defaultInputProps.style, { width: '100%' }]}
                label="Adresă completă *"
                placeholder="Strada, Număr, Sector, Oraș"
                value={formData.address}
                onChangeText={(t) => setFormData({ ...formData, address: t })}
            />

            {/* 3. Doar elementele dintr-un rând primesc flex: 1 pentru a împărți spațiul orizontal */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TextInput
                    {...defaultInputProps}
                    style={[defaultInputProps.style, { flex: 1 }]}
                    label="Latitudine"
                    placeholder="ex: 44.4268"
                    value={formData.latitude}
                    onChangeText={(t) => setFormData({ ...formData, latitude: t })}
                    keyboardType="numeric"
                />
                <TextInput
                    {...defaultInputProps}
                    style={[defaultInputProps.style, { flex: 1 }]}
                    label="Longitudine"
                    placeholder="ex: 26.1025"
                    value={formData.longitude}
                    onChangeText={(t) => setFormData({ ...formData, longitude: t })}
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity style={{ marginBottom: 20, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 12, color: theme.colors.primary, opacity: 0.8 }}>Găsește coordonatele pe Google Maps →</Text>
            </TouchableOpacity>

            {/* 4. Textarea-ul primește o înălțime fixă pentru a nu se "bate" cu hook-ul tău */}
            <TextInput
                {...defaultInputProps}
                style={[defaultInputProps.style, { height: 100, width: '100%' }]}
                label="Descriere business"
                placeholder="Scrie câteva cuvinte despre serviciile tale..."
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                multiline
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeaderCentered}>
                {/* ICONIȚA NOUĂ ADĂUGATĂ AICI */}
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="build-outline" size={32} color="#3B82F6" />
                </View>

                <Text style={[styles.stepTitle, { color: theme.colors.text.main, marginBottom: 16 }]}>Ce servicii oferi?</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>Selectează toate categoriile aplicabile</Text>
            </View>

            <View style={styles.servicesGrid}>
                {SERVICE_CATEGORIES.map(service => {
                    const isSelected = formData.services.includes(service);
                    return (
                        <TouchableOpacity
                            key={service}
                            activeOpacity={0.7}
                            onPress={() => toggleService(service)}
                            style={[
                                styles.serviceCard,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.light },
                                isSelected && { backgroundColor: 'rgba(9, 123, 176, 0.05)', borderColor: theme.colors.primary }
                            ]}
                        >
                            <Text style={[styles.serviceText, { color: isSelected ? theme.colors.primary : theme.colors.text.main, fontWeight: isSelected ? '700' : '500' }]}>
                                {service}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeaderCentered}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <Ionicons name="time-outline" size={32} color="#F59E0B" />
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Program de lucru</Text>
            </View>

            <View style={styles.scheduleList}>
                {DAYS_OF_WEEK.map(day => {
                    const dayData = formData.schedule[day.id];
                    const isClosed = !dayData.isOpen;

                    return (
                        <View key={day.id} style={[styles.dayRow, isClosed && { opacity: 0.6 }]}>
                            {/* Ziua din stânga (Acum are flex: 1 pentru a ocupa spațiul fluid) */}
                            <TouchableOpacity onPress={() => toggleDayStatus(day.id)} style={styles.dayToggle}>
                                <Ionicons name={isClosed ? "square-outline" : "checkbox"} size={24} color={isClosed ? theme.colors.text.placeholder : theme.colors.primary} />
                                <Text style={[styles.dayLabel, { color: theme.colors.text.main }]} numberOfLines={1}>{day.label}</Text>
                            </TouchableOpacity>

                            {/* Orele din dreapta (Ocupă restul de spațiu și se aliniază la dreapta) */}
                            <View style={styles.timeInputsContainer}>
                                {isClosed ? (
                                    <View style={[styles.closedBadge, { backgroundColor: theme.colors.surface }]}>
                                        <Text style={[styles.closedText, { color: theme.colors.text.muted }]}>Închis</Text>
                                    </View>
                                ) : (
                                    <View style={styles.timeInputsRow}>
                                        <TouchableOpacity
                                            style={[styles.timeBox, { borderColor: theme.colors.border.medium, backgroundColor: theme.colors.background }]}
                                            onPress={() => setTimePicker({ visible: true, dayId: day.id, type: 'open' })}
                                        >
                                            <Text style={{ color: theme.colors.text.main, fontSize: 13, fontWeight: '500' }}>{dayData.open}</Text>
                                        </TouchableOpacity>

                                        <Text style={{ marginHorizontal: 6, color: theme.colors.text.muted }}>-</Text>

                                        <TouchableOpacity
                                            style={[styles.timeBox, { borderColor: theme.colors.border.medium, backgroundColor: theme.colors.background }]}
                                            onPress={() => setTimePicker({ visible: true, dayId: day.id, type: 'close' })}
                                        >
                                            <Text style={{ color: theme.colors.text.main, fontSize: 13, fontWeight: '500' }}>{dayData.close}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} showsVerticalScrollIndicator={false}>

                <View style={[
                    styles.contentWrapper, { width: maxWidth },
                    isDesktop && { backgroundColor: theme.colors.surface, marginVertical: 40, borderRadius: 24, padding: 32, ...theme.shadows.card }
                ]}>

                    {/* HEADER & PROGRESS BAR */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={theme.colors.text.main} />
                            </TouchableOpacity>
                            <View>
                                <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>Adaugă Locație</Text>
                                <Text style={{ color: theme.colors.text.muted }}>Pasul {step} din 3</Text>
                            </View>
                        </View>

                        <View style={styles.progressBarRow}>
                            {[1, 2, 3].map(i => (
                                <View key={i} style={[
                                    styles.progressSegment,
                                    { backgroundColor: i <= step ? theme.colors.primary : theme.colors.border.light }
                                ]} />
                            ))}
                        </View>
                    </View>

                    {/* RENDERING DINAMIC */}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* FOOTER BUTTON (Spacer împinge butonul jos) */}
                    <View style={{ flex: 1, minHeight: 40 }} />

                    <TouchableOpacity
                        style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueText}>{step === 3 ? 'Finalizează înregistrarea' : 'Continuă'}</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* MODAL PENTRU SELECTAREA OREI */}
            {timePicker && (
                <View style={styles.timeModalOverlay}>
                    <View style={[styles.timeModalContainer, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.timeModalHeader}>
                            <Text style={[styles.timeModalTitle, { color: theme.colors.text.main }]}>
                                {timePicker.type === 'open' ? 'Ora deschidere' : 'Ora închidere'}
                            </Text>
                            <TouchableOpacity onPress={() => setTimePicker(null)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.timeOptionsGrid}>
                                {TIME_OPTIONS.map(time => {
                                    // Evidențiază ora deja selectată
                                    const isSelected = formData.schedule[timePicker.dayId][timePicker.type] === time;
                                    return (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeOptionBtn,
                                                { borderColor: theme.colors.border.light, backgroundColor: theme.colors.background },
                                                isSelected && { borderColor: theme.colors.primary, backgroundColor: 'rgba(9, 123, 176, 0.1)' }
                                            ]}
                                            onPress={() => handleTimeSelect(time)}
                                        >
                                            <Text style={[
                                                styles.timeOptionText,
                                                { color: theme.colors.text.main },
                                                isSelected && { color: theme.colors.primary, fontWeight: '700' }
                                            ]}>
                                                {time}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contentWrapper: { flex: 1, padding: 24, paddingTop: Platform.OS === 'android' ? 60 : 24 },

    // Header
    header: { marginBottom: 32 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    progressBarRow: { flexDirection: 'row', gap: 8 },
    progressSegment: { flex: 1, height: 4, borderRadius: 2 },

    // Step Containers
    stepContainer: { width: '100%' },
    iconCircle: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    stepTitle: { fontSize: 22, fontWeight: '800', marginTop: 16 },
    stepSubtitle: { fontSize: 14, marginBottom: 24, marginTop: -16 },
    stepHeaderCentered: { alignItems: 'center', marginBottom: 24 },

    // Services Grid
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    serviceCard: { width: '47%', paddingVertical: 20, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    serviceText: { fontSize: 14, textAlign: 'center' },

    // Schedule List
    scheduleList: { width: '100%', gap: 8 },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' },
    dayToggle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    dayLabel: { fontSize: 15, fontWeight: '600', marginLeft: 12 },

    timeInputsContainer: { flex: 1.5, alignItems: 'flex-end' }, // Împinge butoanele spre dreapta
    timeInputsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },

    timeBox: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minWidth: 65 }, // minWidth micșorat
    closedBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, minWidth: 140, alignItems: 'center' },
    closedText: { fontSize: 13, fontWeight: '700' },


    timeModalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    timeModalContainer: { width: '90%', maxWidth: 400, height: '70%', borderRadius: 24, padding: 24, ...Platform.select({ web: { boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' } as any }) },
    timeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    timeModalTitle: { fontSize: 18, fontWeight: '700' },
    timeOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
    timeOptionBtn: { width: '31%', paddingVertical: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center', marginBottom: 4 },
    timeOptionText: { fontSize: 15, fontWeight: '500' },
    // Footer Button
    continueButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});