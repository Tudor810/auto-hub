import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,

} from 'react-native';
import { useTheme, TextInput, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';


// Assuming you have this hook to get the user's cars
import { useCars } from '@/hooks/useCars';
import { useAvailableSlots } from '@/hooks/useAvaibleSlots';
import { useAllLocations } from '@/hooks/useAllLocations';
import ErrorMessage from '@/components/ErrorMessage';
import { useServices } from '@/hooks/useServices';
import { useInputProps } from '@/hooks/useInputProps';
import { IAppointmentFormData } from '@auto-hub/shared/types/appointmentTypes';
import { useAppointments } from '@/hooks/useAppointments';

export default function NewAppointmentScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const defaultStyles = useDefaultStyles();
    const defaultInputProps = useInputProps();

    // In a real app, you'd pass location details & selected services via router params
    const { locationId, serviceIds } = useLocalSearchParams();
    const { cars, refreshCars } = useCars(); // Fetch user's garage
    const { allLocations } = useAllLocations();
    const { services } = useServices(locationId as string);

    const selectedLocation = allLocations.filter(loc => loc._id === locationId)[0];
    const targetIds = (serviceIds as string).split(',');

    const { addAppointment } = useAppointments(locationId as string);


    useFocusEffect(
        useCallback(() => {
            // This runs every single time the user lands on this screen
            // (including when they press "back" from the add-car screen)
            refreshCars();

            // Return a cleanup function if needed (rarely needed for just a fetch)
            return () => { };
        }, [refreshCars]) // Dependency array
    );


    const safeParseDuration = (duration: string | number | undefined): number => {
        if (!duration) return 0;

        if (typeof duration === 'number') return duration;
        const parsed = parseInt(duration.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const selectedServices = services.filter(srv => targetIds.includes(srv._id));
    const { totalDuration, totalPrice } = useMemo(() => {
        return selectedServices.reduce(
            (acc, service) => {
                // Safe parse duration (string -> number)
                const durationValue = safeParseDuration(service.duration);

                // Safe parse price (assuming price might also be a string)
                const priceValue = typeof service.price === 'string'
                    ? parseFloat(service.price) || 0
                    : service.price || 0;

                return {
                    totalDuration: acc.totalDuration + durationValue,
                    totalPrice: acc.totalPrice + priceValue,
                };
            },
            { totalDuration: 0, totalPrice: 0 } // Initial object
        );
    }, [selectedServices]);

    // --- FORM STATE ---
    const [step, setStep] = useState(1);
    const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const { slots: availableSlots, isLoadingSlots } = useAvailableSlots(locationId as string, selectedDate, totalDuration);

    // Mock calculations based on your screenshots

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 600 : '100%';

    // --- HANDLERS ---
    const handleNext = async () => {
        if (step === 1) {
            if (!selectedCarId) return setError('Te rugăm să selectezi sau să adaugi o mașină.');
            setStep(2);
        } else if (step === 2) {
            if (!selectedTime) return setError('Te rugăm să alegi o oră disponibilă.');
            setStep(3);
        } else if (step === 3) {
            // Finalize booking
            console.log("Booking confirmed!", { selectedCarId, selectedDate, selectedTime, notes });

            if (!selectedCarId) return setError('Te rugăm să selectezi sau să adaugi o mașină.');
            if (!selectedTime) return setError('Te rugăm să alegi o oră disponibilă.');

            const appointmentData: IAppointmentFormData = {
                locationId: locationId as string,
                carId: selectedCarId,
                serviceIds: targetIds,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                notes: notes
            }

            const resp = await addAppointment(appointmentData);

            if (resp.success) {
                setStep(4);
            } else {
                setError(resp.error || "");
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const selectedCar = cars?.find((c: any) => c._id === selectedCarId);

    // --- RENDER STEPS ---
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Selectează mașina</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>Pentru care mașină faci programarea?</Text>
            </View>

            <View style={styles.carList}>
                {/* Render existing cars if any */}
                {cars && cars.length > 0 && cars.map((car: any) => {
                    const isSelected = selectedCarId === car._id;
                    return (
                        <TouchableOpacity
                            key={car._id}
                            activeOpacity={0.8}
                            onPress={() => { setSelectedCarId(car._id); setError("") }}
                            style={[
                                styles.carCard,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border?.light || '#E5E7EB' },
                                isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                            ]}
                        >
                            <Ionicons name="car-sport" size={24} color={isSelected ? theme.colors.primary : theme.colors.text.main} />
                            <View style={styles.carCardInfo}>
                                <Text style={[styles.carCardMake, { color: theme.colors.text.main }]}>{car.make} {car.model}</Text>
                                <Text style={[styles.carCardPlate, { color: theme.colors.text.muted }]}>{car.plateNr}</Text>
                            </View>
                            {isSelected && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                        </TouchableOpacity>
                    );
                })}

                {/* Dashed Add Car Button */}
                <TouchableOpacity
                    style={[styles.addCarDashedBtn, { borderColor: theme.colors.border?.medium || '#D1D5DB' }]}
                    activeOpacity={0.6}
                    onPress={() => router.push({
                        pathname: '/(client)/add-car',
                        params: {origin: 'appointment'}
                    })}
                >
                    <Ionicons name="car-outline" size={20} color={theme.colors.text.main} style={{ marginRight: 8 }} />
                    <Text style={[styles.addCarDashedText, { color: theme.colors.text.main }]}>Adaugă o mașină</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Alege data și ora</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>Când dorești să vii?</Text>
            </View>

            {/* Calendar */}
            <View style={[styles.calendarWrapper, { backgroundColor: theme.colors.surface }]}>
                <DateTimePicker
                    mode="single"
                    date={selectedDate}
                    onChange={(params: any) => {
                        if (params.date) setSelectedDate(new Date(params.date));
                        setSelectedTime(null); // Reset time when date changes
                        setError(""); // Clear any previous errors
                    }}
                    styles={{
                        ...defaultStyles,
                        header: { color: theme.colors.text.main, fontWeight: 'bold' },
                        weekday_label: { color: theme.colors.text.muted },
                        day_label: { color: theme.colors.text.main },
                        selected: { backgroundColor: theme.colors.primary },
                        selected_label: { color: '#FFFFFF', fontWeight: 'bold' },
                    }}
                />
            </View>

            {/* Time Slots Header */}
            <Text style={[styles.timeTitle, { color: theme.colors.text.main }]}>
                Ore disponibile - {format(selectedDate, 'dd MMMM', { locale: ro })}
            </Text>

            {/* Time Grid with Dynamic Rendering */}
            <View style={styles.timeGrid}>
                {isLoadingSlots ? (
                    // STATE 1: LOADING
                    <View style={{ width: '100%', paddingVertical: 32, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 12, color: theme.colors.text.muted }}>
                            Căutăm orele disponibile...
                        </Text>
                    </View>
                ) : availableSlots.length === 0 ? (
                    // STATE 2: NO SLOTS AVAILABLE
                    <View style={{ width: '100%', paddingVertical: 24, alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 12 }}>
                        <Text style={{ color: theme.colors.text.main, fontWeight: '600', marginBottom: 4 }}>
                            Ne pare rău!
                        </Text>
                        <Text style={{ color: theme.colors.text.muted, textAlign: 'center' }}>
                            Nu există ore disponibile pentru această dată. Te rugăm să alegi o altă zi.
                        </Text>
                    </View>
                ) : (
                    // STATE 3: SLOTS LOADED SUCCESSFULLY
                    availableSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                            <TouchableOpacity
                                key={time}
                                activeOpacity={0.7}
                                onPress={() => { setSelectedTime(time); setError(""); }}
                                style={[
                                    styles.timeBox,
                                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface },
                                    isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.timeText,
                                    { color: theme.colors.text.main },
                                    isSelected && { color: '#FFFFFF', fontWeight: '700' }
                                ]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Confirmă programarea</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>Verifică detaliile înainte de a trimite</Text>
            </View>

            {/* Summary Cards */}
            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                {/* Date Row */}
                <View style={[styles.summaryRow, { borderBottomColor: theme.colors.border.light }]}>
                    <View style={[styles.summaryIconBox, { backgroundColor: theme.colors.background }]}>
                        <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
                    </View>
                    <View style={styles.summaryTextWrap}>
                        <Text style={[styles.summaryMainText, { color: theme.colors.text.main }]}>
                            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: ro })}
                        </Text>
                        <Text style={[styles.summarySubText, { color: theme.colors.text.muted }]}>{selectedTime}</Text>
                    </View>
                </View>

                {/* Car Row */}
                <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <View style={[styles.summaryIconBox, { backgroundColor: theme.colors.background }]}>
                        <Ionicons name="car-outline" size={22} color={theme.colors.text.muted} />
                    </View>
                    <View style={styles.summaryTextWrap}>
                        <Text style={[styles.summaryMainText, { color: theme.colors.text.main }]}>
                            {selectedCar?.make || "Seat"} {selectedCar?.model || "Toledo"}
                        </Text>
                        <Text style={[styles.summarySubText, { color: theme.colors.text.muted }]}>{selectedCar?.plateNr || "B134ABC"}</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, flexDirection: 'column', alignItems: 'stretch' }]}>
                <Text style={[styles.summarySectionTitle, { color: theme.colors.text.main }]}>Servicii selectate</Text>
                {selectedServices.map(srv => {
                    return <View key={srv._id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: theme.colors.text.muted }}>{srv.name}</Text>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: theme.colors.text.main }}>{srv.price} RON</Text>
                    </View>
                })}

            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, flexDirection: 'column', alignItems: 'stretch' }]}>
                <Text style={[styles.summarySectionTitle, { color: theme.colors.text.main }]}>Note adiționale</Text>
                <TextInput
                    {...defaultInputProps}
                    style={{ height: 100, width: '100%' }}
                    numberOfLines={4}
                    placeholder="Ex: Problemă la frâne, zgomot motor..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
            </View>
        </View>
    );

    const renderSuccessStep = () => {
        // Format the date securely just like the screenshot
        const formattedDate = selectedDate
            ? format(selectedDate, 'dd MMM yyyy', { locale: ro })
            : '';

        return (
            <View style={[styles.successContainer, { backgroundColor: theme.colors.background }]}>
                <View style={[
                    styles.successCard,
                    {
                        backgroundColor: theme.colors.surface,
                        // Optional: If you want a subtle border in dark mode
                        borderColor: theme.colors.border?.light || 'transparent',
                        borderWidth: theme.colors.dark ? 1 : 0
                    }
                ]}>

                    {/* 1. Success Icon (Kept semantic green for the success vibe) */}
                    <View style={[styles.successIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                        <Ionicons name="checkmark" size={40} color="#10B981" />
                    </View>

                    {/* 2. Titles */}
                    <Text style={[styles.successTitle, { color: theme.colors.text.main }]}>
                        Programare trimisă!
                    </Text>
                    <Text style={[styles.successSubtitle, { color: theme.colors.text.muted }]}>
                        Cererea ta a fost trimisă către {selectedLocation?.name || 'locație'}. Vei primi o confirmare în curând.
                    </Text>

                    {/* 3. Summary Box */}
                    <View style={[styles.successSummaryBox, { backgroundColor: theme.colors.background }]}>

                        <View style={[styles.successSummaryRow, { borderBottomColor: theme.colors.border?.light || '#E5E7EB' }]}>
                            <Text style={[styles.successSummaryLabel, { color: theme.colors.text.muted }]}>Data</Text>
                            <Text style={[styles.successSummaryValue, { color: theme.colors.text.main }]}>{formattedDate}</Text>
                        </View>

                        <View style={[styles.successSummaryRow, { borderBottomColor: theme.colors.border?.light || '#E5E7EB' }]}>
                            <Text style={[styles.successSummaryLabel, { color: theme.colors.text.muted }]}>Ora</Text>
                            <Text style={[styles.successSummaryValue, { color: theme.colors.text.main }]}>{selectedTime}</Text>
                        </View>

                        <View style={[styles.successSummaryRow, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                            <Text style={[styles.successSummaryLabel, { color: theme.colors.text.muted }]}>Total</Text>
                            <Text style={[styles.successSummaryValue, { color: theme.colors.text.main }]}>{totalPrice} RON</Text>
                        </View>

                    </View>

                    {/* 4. Action Button */}
                    <TouchableOpacity
                        style={[styles.successButton, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.8}
                        onPress={() => router.replace('/(client)/(tabs)/program')}
                    >
                        <Text style={styles.successButtonText}>Vezi programările mele</Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    };

    if (!selectedLocation)
        return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

            {step === 4 ? (
                renderSuccessStep()
            ) : (
                <>
                    <KeyboardAwareScrollView
                        style={{ flex: 1 }}
                        // Removed the massive paddingBottom hack. Just added a normal 32px padding for breathing room.
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={[
                            styles.contentWrapper, { width: maxWidth },
                            isDesktop && { backgroundColor: theme.colors.surface, marginVertical: 40, borderRadius: 24, padding: 32, ...Platform.select({ web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' } as any }) }
                        ]}>

                            {/* HEADER & PROGRESS BAR */}
                            <View style={styles.header}>
                                <View style={styles.headerTop}>
                                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                        <Ionicons name="arrow-back" size={24} color={theme.colors.text.main} />
                                    </TouchableOpacity>
                                    <View>
                                        <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>Programare nouă</Text>
                                        <Text style={{ color: theme.colors.text.muted }}>{selectedLocation.name}</Text>
                                    </View>
                                </View>

                                <View style={styles.progressBarRow}>
                                    {[1, 2, 3].map(i => (
                                        <View key={i} style={[
                                            styles.progressSegment,
                                            { backgroundColor: i <= step ? theme.colors.primary : theme.colors.border?.light || '#E5E7EB' }
                                        ]} />
                                    ))}
                                </View>
                            </View>

                            {/* RENDERING DINAMIC */}
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}

                        </View>
                    </KeyboardAwareScrollView>

                    <View style={[styles.stickyBottomBar, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, 16), borderTopColor: theme.colors.border.medium }]}>
                        <View style={styles.bottomBarInner}>

                            <View style={styles.bottomBarInfo}>
                                <View>
                                    <Text style={[styles.bottomBarLabel, { color: theme.colors.text.muted }]}>Total estimat</Text>
                                    <Text style={[styles.bottomBarPrice, { color: theme.colors.text.main }]}>{totalPrice} RON</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.bottomBarLabel, { color: theme.colors.text.muted }]}>Durată</Text>
                                    <Text style={[styles.bottomBarDuration, { color: theme.colors.text.main }]}>~{totalDuration} min</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                                activeOpacity={0.8}
                                onPress={handleNext}
                            >
                                <Text style={styles.continueButtonText}>{step === 3 ? 'Confirmă programarea' : 'Continuă'} <Ionicons name="chevron-forward" size={16} /></Text>
                            </TouchableOpacity>
                            {error && <ErrorMessage message={error} />}
                        </View>
                    </View>
                </>
            )}
        </View >
    );
}

const styles = StyleSheet.create({
    scrollContent: { flexGrow: 1, alignItems: 'center' },
    contentWrapper: { flex: 1, padding: 24, paddingTop: Platform.OS === 'android' ? 60 : 24 },

    // Header
    header: { marginBottom: 32 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(150,150,150,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    progressBarRow: { flexDirection: 'row', gap: 8 },
    progressSegment: { flex: 1, height: 4, borderRadius: 2 },

    stepContainer: { width: '100%' },
    stepHeader: { marginBottom: 24 },
    stepTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    stepSubtitle: { fontSize: 15 },

    // --- STEP 1: CARS ---
    carList: { gap: 12 },
    carCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    carCardInfo: { flex: 1, marginLeft: 16 },
    carCardMake: { fontSize: 16, fontWeight: '700' },
    carCardPlate: { fontSize: 14, marginTop: 2 },
    addCarDashedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
    addCarDashedText: { fontSize: 16, fontWeight: '600' },

    // --- STEP 2: DATE & TIME ---
    calendarWrapper: { borderRadius: 16, padding: 16, marginBottom: 24, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.05)' } as any }) },
    timeTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    timeBox: { width: '31%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    timeText: { fontSize: 15, fontWeight: '500' },

    // --- STEP 3: SUMMARY ---
    summaryCard: { padding: 20, borderRadius: 16, marginBottom: 16, elevation: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }, web: { boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' } as any }) },
    summaryRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1 },
    summaryIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    summaryTextWrap: { flex: 1 },
    summaryMainText: { fontSize: 16, fontWeight: '700', marginBottom: 4, textTransform: 'capitalize' },
    summarySubText: { fontSize: 14 },
    summarySectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

    // --- STICKY BOTTOM BAR ---
    stickyBottomBar: {
        // REMOVED: position, bottom, left, right
        borderTopWidth: 1,
        paddingTop: 16,
        paddingHorizontal: 24,
        elevation: 10,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8 },
            web: { boxShadow: '0px -4px 16px rgba(0,0,0,0.05)' } as any,
        }),
    },
    bottomBarInner: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    bottomBarInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bottomBarLabel: { fontSize: 13, marginBottom: 2 },
    bottomBarPrice: { fontSize: 24, fontWeight: '800' },
    bottomBarDuration: { fontSize: 16, fontWeight: '600' },
    continueButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    successCard: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        elevation: 4,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
            web: { boxShadow: '0px 8px 24px rgba(0,0,0,0.08)' } as any,
        }),
    },
    successIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    successSummaryBox: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
    },
    successSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
    },
    successSummaryLabel: {
        fontSize: 15,
    },
    successSummaryValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    successButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    successButtonText: {
        color: '#FFFFFF', // Button text usually stays white even in light/dark mode
        fontSize: 16,
        fontWeight: '600',
    },
});