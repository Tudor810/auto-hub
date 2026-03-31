import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme, TextInput, HelperText, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// 🚨 Asigură-te că ruta către hook-ul tău este corectă
import { useInputProps } from '../../hooks/useInputProps';
import { ILocationFormData, ILocation } from '@auto-hub/shared/types/locationTypes';
import ErrorMessage from '@/components/ErrorMessage';
import { useBusiness } from '@/context/BusinessContext';

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
    const { saveLocationData, locations } = useBusiness();
    const { id, origin } = useLocalSearchParams();
    const existingLocation: ILocation = locations.find(loc => loc._id === id);

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
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

    const handleTimeSelect = (time: string) => {
        if (!timePicker) return;

        const { dayId, type } = timePicker;
        setFormErrors(prev => ({
            ...prev,
            schedule: ""
        }))
        // 1. Create the potential new state for this day
        const updatedDay = {
            ...formData.schedule[dayId],
            [type]: time
        };

        // 2. Immediate validation check
        const openMin = timeToMinutes(type === 'open' ? time : updatedDay.open);
        const closeMin = timeToMinutes(type === 'close' ? time : updatedDay.close);

        if (type === 'close' && closeMin <= openMin) {
            setSnackbar({
                visible: true,
                message: "Ora de închidere nu poate fi înainte sau egală cu ora de deschidere."
            })
            return; // Don't save it
        }

        if (type === 'open' && openMin >= closeMin) {
            // setFormErrors(prev => ({
            //     ...prev,
            //     schedule: "Ora de deschidere nu poate fi după ora de închidere."
            // }))
            setSnackbar({
                visible: true,
                message: "Ora de deschidere nu poate fi după ora de închidere."
            })
            return; // Don't save it
        }

        // 3. If valid, save to state
        setFormData(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [dayId]: updatedDay
            }
        }));

        setTimePicker(null);
    };
    // --- STAREA FORMULARULUI ---
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const defaultState: ILocationFormData = {
        name: '',
        address: '',
        coordinates: { latitude: '', longitude: '' },
        description: '',
        services: [],
        schedule: DAYS_OF_WEEK.reduce((acc, day) => {
            acc[day.id] = { isOpen: day.id !== 'duminica', open: '08:00', close: '18:00' };
            return acc;
        }, {} as ILocationFormData['schedule'])
    };

    // 3. Initialize the state using a lazy function
    const [formData, setFormData] = useState<ILocationFormData>(() => {
        // If we found a location, map its data to the form state
        if (existingLocation) {
            return {
                name: existingLocation.name || '',
                address: existingLocation.address || '',
                description: existingLocation.description || '',
                services: existingLocation.services || [],
                // Ensure coordinates are converted back to strings for the TextInputs
                coordinates: {
                    latitude: existingLocation.coordinates?.latitude ? String(existingLocation.coordinates.latitude) : '',
                    longitude: existingLocation.coordinates?.longitude ? String(existingLocation.coordinates.longitude) : '',
                },
                // Fallback to default schedule if for some reason it's missing
                schedule: existingLocation.schedule || defaultState.schedule
            };
        }

        // Otherwise, we are creating a new location, so return the empty defaults
        return defaultState;
    });

    const [formErrors, setFormErrors] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        description: '',
        services: '',
        schedule: ''
    });

    const validateName = (name: string) => !name.trim() ? 'Introduceți numele locației.' : '';
    const validateAddress = (addr: string) => !addr.trim() ? 'Introduceți adresa completă.' : '';
    const validateLatitude = (lat: string) => {
        if (!lat.trim()) return 'Latitudinea este obligatorie.';
        const num = parseFloat(lat.replace(',', '.'));
        if (isNaN(num) || num < -90 || num > 90) return 'Latitudine invalidă (-90 la 90).';
        return '';
    };

    const validateLongitude = (lng: string) => {
        if (!lng.trim()) return 'Longitudinea este obligatorie.';
        const num = parseFloat(lng.replace(',', '.'));
        if (isNaN(num) || num < -180 || num > 180) return 'Longitudine invalidă (-180 la 180).';
        return '';
    };

    const validateServices = (services: string[]) => services.length === 0 ? 'Selectați cel puțin un serviciu oferit.' : '';

    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };


    const [nextClicked, setNextClicked] = useState([false, false, false])
    // --- HANDLERS ---
    const handleNext = async () => {
        if (step < 3) {

            setNextClicked(prevState => prevState.map((clicked, index) =>
                index === step - 1 ? true : clicked
            ))

            if (step === 1) {
                const nameErr = validateName(formData.name);
                const addressErr = validateAddress(formData.address);
                const latitudeErr = validateLatitude(formData.coordinates.latitude);
                const longitudeErr = validateLongitude(formData.coordinates.longitude);

                setFormErrors(prevErrors => ({
                    ...prevErrors,
                    name: nameErr,
                    address: addressErr,
                    latitude: latitudeErr,
                    longitude: longitudeErr
                }));

                if (nameErr || addressErr || latitudeErr || longitudeErr) {
                    return;
                }
            } else if (step === 2) {
                const serviceErr = validateServices(formData.services);

                setFormErrors(prev => ({
                    ...prev,
                    services: serviceErr
                }));

                if (serviceErr)
                    return;
            }

            setStep(step + 1);
        }
        else {
            if (existingLocation) {
                const resp = await saveLocationData(formData, 'PUT', id as string);

                if (resp.success === true) {
                    router.back();
                } else {
                    setError(resp.error || "");
                }
            } else {
                const resp = await saveLocationData(formData, 'POST');
                if (resp.success === true) {
                    router.back();
                } else {
                    setError(resp.error || "");
                }
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else {
            if (origin === 'location') {
                router.push({
                    pathname: "/(service)/(location)/[id]",
                    params: { id: existingLocation._id }
                });
            } else
                router.navigate("/(service)/(tabs)/profile");
        }
    };

    const toggleService = (service: string) => {

        const isCurrentlySelected = formData.services.includes(service);
        const updatedServices = isCurrentlySelected
            ? formData.services.filter(s => s !== service)
            : [...formData.services, service];

        setFormData(prev => ({
            ...prev,
            services: updatedServices
        }));

        if (nextClicked[1]) {
            setFormErrors(prev => ({
                ...prev,
                services: validateServices(updatedServices)
            }));
        }
    };

    const toggleDayStatus = (dayId: string) => {
        setFormData(prev => ({
            ...prev,
            schedule: { ...prev.schedule, [dayId]: { ...prev.schedule[dayId], isOpen: !prev.schedule[dayId].isOpen } }
        }));
    };

    // --- RENDER PAȘI ---

    const nameInputProps = useInputProps(undefined, !!formErrors.name);
    const addressInputProps = useInputProps(undefined, !!formErrors.address);
    const latitudeInputProps = useInputProps(undefined, !!formErrors.latitude);
    const longitudeInputProps = useInputProps(undefined, !!formErrors.longitude);


    const renderStep1 = () => (
        <View style={styles.stepContainer}>

            {/* 1. Am izolat centrarea doar pentru Titlu și Icon */}
            <View style={styles.stepHeaderCentered}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="location-outline" size={32} color="#10B981" />
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Locație & Descriere</Text>
            </View>

            {/* 2. NOU: Wrapper pentru formular care aplică automat spațiere (gap) între toate elementele */}
            <View style={{ width: '100%', gap: 0 }}>

                <View style={styles.inputWrapper}>
                    <TextInput
                        {...nameInputProps}
                        label="Nume locație *"
                        placeholder="ex: Garajul AutoHUB, Service Pipera"
                        value={formData.name}
                        onChangeText={(t) => {
                            setFormData({ ...formData, name: t });
                            if (nextClicked[0]) setFormErrors(prev => ({ ...prev, name: validateName(t) }))
                        }}
                    />
                    <HelperText type="error" visible={!!formErrors.name} style={styles.helperText}>{formErrors.name}</HelperText>
                </View>
                {/* Input Adresă */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        {...addressInputProps}
                        label="Adresă completă *"
                        placeholder="Strada, Număr, Sector, Oraș"
                        value={formData.address}
                        onChangeText={(t) => {
                            setFormData({ ...formData, address: t });
                            if (nextClicked[0]) setFormErrors(prev => ({ ...prev, address: validateAddress(t) }))
                        }}
                    />
                    <HelperText type="error" visible={!!formErrors.address} style={styles.helperText}>{formErrors.address}</HelperText>
                </View>
                {/* Container pentru Coordonate + Link Google Maps */}
                <TouchableOpacity style={{ alignSelf: 'flex-start', marginLeft: 8 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.primary, opacity: 0.8 }}>Găsește coordonatele pe Google Maps →</Text>
                </TouchableOpacity>
                <View style={{ width: '100%' }}>
                    <View style={styles.rowContainer}>
                        <View style={styles.flexHalf}>
                            <TextInput
                                {...latitudeInputProps}
                                label="Latitudine"
                                placeholder="ex: 44.4268"
                                value={formData.coordinates.latitude}
                                onChangeText={(t) => {
                                    setFormData({
                                        ...formData, coordinates: {
                                            ...formData.coordinates,
                                            latitude: t
                                        }
                                    })
                                    if (nextClicked[0]) setFormErrors(prev => ({ ...prev, latitude: validateLatitude(t) }))
                                }}
                                keyboardType="numeric"
                            />
                            <HelperText type="error" visible={!!formErrors.latitude} style={styles.helperText}>{formErrors.latitude}</HelperText>
                        </View>
                        <View style={styles.flexHalf}>
                            <TextInput
                                {...longitudeInputProps}
                                label="Longitudine"
                                placeholder="ex: 26.1025"
                                value={formData.coordinates.longitude}
                                onChangeText={(t) => {
                                    setFormData({
                                        ...formData, coordinates: {
                                            ...formData.coordinates,
                                            longitude: t
                                        }
                                    })
                                    if (nextClicked[0]) setFormErrors(prev => ({ ...prev, longitude: validateLongitude(t) }))
                                }}
                                keyboardType="numeric"
                            />
                            <HelperText type="error" visible={!!formErrors.longitude} style={styles.helperText}>{formErrors.longitude}</HelperText>
                        </View>
                    </View>


                </View>

                {/* Input Descriere */}
                <TextInput
                    {...defaultInputProps}
                    style={{ height: 100, width: '100%' }}
                    label="Descriere business"
                    placeholder="Scrie câteva cuvinte despre serviciile tale..."
                    value={formData.description}
                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                    multiline
                />

            </View>
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
            {formErrors.services && <ErrorMessage message={formErrors.services} />}
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
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={20}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={!timePicker}
            >
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
                                <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>{existingLocation ? "Editează Locație" : "Adaugă Locație"}</Text>
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
                    {error && <ErrorMessage message={error} />}
                </View>

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
                                {formErrors.schedule && <ErrorMessage message={formErrors.schedule} />}
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
            </KeyboardAwareScrollView>
            <Snackbar
                visible={snackbar.visible}
                onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
                duration={3000}
                style={{ backgroundColor: theme.colors.error, borderRadius: 12 }}
                action={{
                    label: 'OK',
                    onPress: () => setSnackbar({ ...snackbar, visible: false }),
                }}
            >
                {snackbar.message}
            </Snackbar>
        </View >
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

    inputWrapper: { marginBottom: 4 },
    helperText: { marginTop: -4, paddingHorizontal: 4 },
    rowContainer: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    flexHalf: { flex: 1 },

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