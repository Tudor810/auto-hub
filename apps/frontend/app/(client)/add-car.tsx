import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions
} from 'react-native';
import { useTheme, TextInput, HelperText, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {ICarFormData} from '@auto-hub/shared/types/carTypes'
import { useInputProps } from '../../hooks/useInputProps';


const CAR_MAKES = ['Audi', 'BMW', 'Dacia', 'Ford', 'Mercedes-Benz', 'Renault', 'Skoda', 'Toyota', 'Volkswagen'];
const FUELS = ['Benzină', 'Diesel', 'Hibrid', 'Electric', 'GPL'];
const YEARS = Array.from({ length: 30 }).map((_, i) => (new Date().getFullYear() - i).toString());

export default function AddCarScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const { id } = useLocalSearchParams(); // Daca vrei sa editezi o masina mai tarziu
    const defaultInputProps = useInputProps();

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 600 : '100%';

    // --- FORM STATE ---
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<ICarFormData>({
        plateNr : '',
        make: '',
        model: '',
        year: '',
        fuel: '',
        vin: '',
        engineCapacity: '',
        color: '',
        itpDate: null,
        rcaDate: null,
        rovinietaDate: null
    });

    const [formErrors, setFormErrors] = useState({
        plate: '',
        make: '',
        model: '',
    });

    const [nextClicked, setNextClicked] = useState([false, false]);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

    // --- SELECTION MODAL STATE ---
    // A single modal state to handle Make, Year, and Fuel selections
    const [selectionModal, setSelectionModal] = useState<{
        visible: boolean;
        type: 'make' | 'year' | 'fuel';
        title: string;
        options: string[];
    } | null>(null);

    // --- VALIDATION ---
    const validatePlate = (val: string) => !val.trim() ? 'Numărul de înmatriculare este obligatoriu.' : '';
    const validateMake = (val: string) => !val.trim() ? 'Marca este obligatorie.' : '';
    const validateModel = (val: string) => !val.trim() ? 'Modelul este obligatoriu.' : '';

    // --- HANDLERS ---
    const handleNext = () => {
        if (step === 1) {
            setNextClicked(prev => { const n = [...prev]; n[0] = true; return n; });

            const plateErr = validatePlate(formData.plateNr);
            const makeErr = validateMake(formData.make);
            const modelErr = validateModel(formData.model);

            setFormErrors({ plate: plateErr, make: makeErr, model: modelErr });

            if (plateErr || makeErr || modelErr) {
                return; // Stop if errors
            }
            setStep(2);
        } else {
            // FINALIZE SAVE
            console.log("Saving Car Data: ", formData);
            setSnackbar({ visible: true, message: 'Mașina a fost adăugată cu succes!' });
            setTimeout(() => {
                router.back();
            }, 1500);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const handleSelectOption = (value: string) => {
        if (!selectionModal) return;

        setFormData(prev => ({ ...prev, [selectionModal.type]: value }));

        // Clear error if they selected a make
        if (selectionModal.type === 'make') {
            setFormErrors(prev => ({ ...prev, make: '' }));
        }

        setSelectionModal(null);
    };

    const openModal = (type: 'make' | 'year' | 'fuel') => {
        if (type === 'make') setSelectionModal({ visible: true, type, title: 'Selectează marca', options: CAR_MAKES });
        if (type === 'year') setSelectionModal({ visible: true, type, title: 'An fabricație', options: YEARS });
        if (type === 'fuel') setSelectionModal({ visible: true, type, title: 'Tip combustibil', options: FUELS });
    };

    // --- REUSABLE DROPDOWN COMPONENT ---
    const SelectInput = ({ label, value, placeholder, error, onPress, flex = 1 }: any) => (
        <View style={{ flex, marginBottom: error ? 0 : 4 }}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>{label}</Text>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                style={[
                    styles.fakeInput,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: error ? theme.colors.error : theme.colors.border?.medium || '#E5E7EB'
                    }
                ]}
            >
                <Text style={{ color: value ? theme.colors.text.main : (theme.colors.text.placeholder || '#9CA3AF'), fontSize: 16 }}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.text.placeholder || '#9CA3AF'} />
            </TouchableOpacity>
            {!!error && <HelperText type="error" style={styles.helperText}>{error}</HelperText>}
        </View>
    );

    // --- RENDER STEPS ---
    const renderStep1 = () => (
        <View style={styles.stepContainer}>

            <View style={styles.stepHeaderCentered}>
                <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="car-outline" size={32} color="#3B82F6" />
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Informații despre mașină</Text>
            </View>

            <View style={{ width: '100%', gap: 12 }}>

                {/* Număr Înmatriculare */}
                <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Număr de înmatriculare *</Text>
                    <TextInput
                        {...defaultInputProps}
                        placeholder="EX: B 123 ABC"
                        value={formData.plateNr}
                        autoCapitalize="characters"
                        onChangeText={(t) => {
                            setFormData({ ...formData, plateNr: t });
                            if (nextClicked[0]) setFormErrors(prev => ({ ...prev, plate: validatePlate(t) }));
                        }}
                        error={!!formErrors.plate}
                    />
                    <HelperText type="error" visible={!!formErrors.plate} style={styles.helperText}>{formErrors.plate}</HelperText>
                </View>

                {/* Marca (Dropdown) */}
                <SelectInput
                    label="Marca *"
                    placeholder="Selectează marca"
                    value={formData.make}
                    error={formErrors.make}
                    onPress={() => openModal('make')}
                />

                {/* Model */}
                <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Model *</Text>
                    <TextInput
                        {...defaultInputProps}
                        placeholder="ex: Golf, Focus, Logan"
                        value={formData.model}
                        onChangeText={(t) => {
                            setFormData({ ...formData, model: t });
                            if (nextClicked[0]) setFormErrors(prev => ({ ...prev, model: validateModel(t) }));
                        }}
                        error={!!formErrors.model}
                    />
                    <HelperText type="error" visible={!!formErrors.model} style={styles.helperText}>{formErrors.model}</HelperText>
                </View>

                {/* An și Combustibil Row */}
                <View style={styles.rowContainer}>
                    <SelectInput
                        label="An fabricație"
                        placeholder="An"
                        value={formData.year}
                        onPress={() => openModal('year')}
                    />
                    <SelectInput
                        label="Combustibil"
                        placeholder="Tip"
                        value={formData.fuel}
                        onPress={() => openModal('fuel')}
                    />
                </View>

                {/* VIN */}
                <View style={styles.inputWrapper}>
                    <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Seria VIN (opțional)</Text>
                    <TextInput
                        {...defaultInputProps}
                        placeholder="17 CARACTERE"
                        value={formData.vin}
                        maxLength={17}
                        autoCapitalize="characters"
                        onChangeText={(t) => setFormData({ ...formData, vin: t })}
                    />
                </View>

            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>

            {/* Main Header for Step 2 */}
            <View style={styles.stepHeaderCentered}>
                <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="document-text-outline" size={32} color="#F59E0B" />
                </View>
                <Text style={[styles.stepTitle, { color: theme.colors.text.main }]}>Detalii finale</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.text.muted }]}>Completează ultimele informații</Text>
            </View>

            <View style={{ width: '100%', gap: 16 }}>

                {/* --- EXTRA DETAILS (Engine & Color) --- */}

                {/* --- EXPIRATION DATES SECTION --- */}
                <View style={{ marginTop: 12 }}>

                    {/* Section Titles */}
                    <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text.main, marginBottom: 4 }}>
                        Date de Expirare
                    </Text>

                    {/* Alert Notification Label */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 6 }}>
                        <Ionicons name="notifications" size={16} color={theme.colors.primary} />
                        <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
                            Primești alerte înainte de expirare
                        </Text>
                    </View>

                    {/* Date Pickers */}
                    <View style={{ gap: 12 }}>
                        <SelectInput
                            label="Expirare ITP"
                            placeholder="Alege data"
                            value={formData.itpDate}
                            onPress={() => console.log('Open Date Picker for ITP')}
                        />
                        <SelectInput
                            label="Expirare RCA"
                            placeholder="Alege data"
                            value={formData.rcaDate}
                            onPress={() => console.log('Open Date Picker for RCA')}
                        />
                        <SelectInput
                            label="Expirare Rovinietă"
                            placeholder="Alege data"
                            value={formData.rovinietaDate}
                            onPress={() => console.log('Open Date Picker for Rovinieta')}
                        />
                    </View>
                    <View style={styles.rowContainer}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Capacitate motor</Text>
                            <TextInput
                                {...defaultInputProps}
                                placeholder="ex: 1968 cm³"
                                keyboardType="numeric"
                                value={formData.engineCapacity}
                                onChangeText={(t) => setFormData({ ...formData, engineCapacity: t })}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.inputLabel, { color: theme.colors.text.main }]}>Culoare</Text>
                            <TextInput
                                {...defaultInputProps}
                                placeholder="ex: Negru"
                                value={formData.color}
                                onChangeText={(t) => setFormData({ ...formData, color: t })}
                            />
                        </View>
                    </View>

                </View>
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
                scrollEnabled={!selectionModal}
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
                                <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>Adaugă mașină</Text>
                                <Text style={{ color: theme.colors.text.muted }}>Pasul {step} din 2</Text>
                            </View>
                        </View>

                        <View style={styles.progressBarRow}>
                            {[1, 2].map(i => (
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

                    <View style={{ flex: 1, minHeight: 40 }} />

                    {/* FOOTER BUTTON */}
                    <TouchableOpacity
                        style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueText}>{step === 2 ? 'Salvează mașina' : 'Continuă'}</Text>
                    </TouchableOpacity>

                </View>

                {/* SELECTION MODAL (Used for Make, Year, Fuel) */}
                {selectionModal && (
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.colors.text.main }]}>{selectionModal.title}</Text>
                                <TouchableOpacity onPress={() => setSelectionModal(null)} style={{ padding: 4 }}>
                                    <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.optionsList}>
                                    {selectionModal.options.map(option => {
                                        const isSelected = formData[selectionModal.type] === option;
                                        return (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.optionBtn,
                                                    { borderBottomColor: theme.colors.border?.light || '#F3F4F6' },
                                                    isSelected && { backgroundColor: theme.colors.primary + '10' }
                                                ]}
                                                onPress={() => handleSelectOption(option)}
                                            >
                                                <Text style={[
                                                    styles.optionText,
                                                    { color: theme.colors.text.main },
                                                    isSelected && { color: theme.colors.primary, fontWeight: '700' }
                                                ]}>
                                                    {option}
                                                </Text>
                                                {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
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
                style={{ backgroundColor: '#10B981', borderRadius: 12 }}
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
    stepSubtitle: { fontSize: 14, marginBottom: 24 },
    stepHeaderCentered: { alignItems: 'center', marginBottom: 24 },

    // Form Inputs
    inputWrapper: { marginBottom: 4 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    helperText: { marginTop: -4, paddingHorizontal: 4 },
    rowContainer: { flexDirection: 'row', gap: 12, marginBottom: 4 },

    // Fake Input for Dropdowns
    fakeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56, // Matches standard React Native Paper height
        borderWidth: 1,
        borderRadius: 12, // Or match your inputProps border radius
        paddingHorizontal: 16,
    },

    // Modal
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContainer: { width: '90%', maxWidth: 400, maxHeight: '70%', borderRadius: 24, padding: 24, ...Platform.select({ web: { boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' } as any }) },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700' },
    optionsList: { paddingBottom: 20 },
    optionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, paddingHorizontal: 8 },
    optionText: { fontSize: 16, fontWeight: '500' },

    // Footer Button
    continueButton: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 24 },
    continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});