import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { useTheme, TextInput, HelperText, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ICarFormData } from '@auto-hub/shared/types/carTypes'
import { useInputProps } from '../../hooks/useInputProps';
import { format } from 'date-fns';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker'
import { useCars } from '@/hooks/useCars';
import ErrorMessage from '@/components/ErrorMessage';

const CAR_MAKES = [
  'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Cupra', 'Dacia', 
  'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep', 'Kia', 
  'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 
  'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Renault', 'Seat', 'Skoda', 
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];
const FUELS = ['Benzină', 'Diesel', 'Hibrid', 'Electric', 'GPL'];
const YEARS = Array.from({ length: 30 }).map((_, i) => (new Date().getFullYear() - i).toString());

export default function AddCarScreen() {
    const theme = useTheme<any>();
    const { width } = useWindowDimensions();
    const { id, origin } = useLocalSearchParams(); // Daca vrei sa editezi o masina mai tarziu
    const defaultInputProps = useInputProps();
    const { cars, addCar, updateCar } = useCars();

    const isWeb = Platform.OS === 'web';
    const isDesktop = isWeb && width >= 800;
    const maxWidth = isDesktop ? 600 : '100%';

    useEffect(() => {
        if (id && cars.length > 0) {
            const existingCar = cars.find(c => c._id === id);

            if (existingCar) {
                setFormData({
                    plateNr: existingCar.plateNr || '',
                    make: existingCar.make || '',
                    model: existingCar.model || '',
                    year: existingCar.year || '',
                    fuel: existingCar.fuel || '',
                    vin: existingCar.vin || '',
                    engineCapacity: existingCar.engineCapacity || '',
                    color: existingCar.color || '',
                    // The DB returns dates as strings, so we convert them back to Date objects for the UI
                    itpDate: existingCar.itpDate ? new Date(existingCar.itpDate) : null,
                    rcaDate: existingCar.rcaDate ? new Date(existingCar.rcaDate) : null,
                    rovinietaDate: existingCar.rovinietaDate ? new Date(existingCar.rovinietaDate) : null
                });
            }
        }
    }, [id, cars]);

    // --- FORM STATE ---
    const [step, setStep] = useState(1);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [activeDateField, setActiveDateField] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const showDatePicker = (field: string) => {
        setActiveDateField(field);
        setDatePickerVisibility(true);
    };
    const defaultStyles = useDefaultStyles();

    const handleConfirmDate = () => {
        if (activeDateField && tempDate) {
            // 2. Format to standard Romanian format: DD.MM.YYYY using date-fns

            setFormData((prev: any) => ({
                ...prev,
                [activeDateField]: tempDate
            }));
        }
        setDatePickerVisibility(false);
        setActiveDateField(null);
    };

    const [formData, setFormData] = useState<ICarFormData>({
        plateNr: '',
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
        year: '',
        fuel: ''
    });

    const [nextClicked, setNextClicked] = useState([false, false]);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
    const [error, setError] = useState("");

    // --- SELECTION MODAL STATE ---
    // A single modal state to handle Make, Year, and Fuel selections
    const [selectionModal, setSelectionModal] = useState<{
        visible: boolean;
        type: 'make' | 'year' | 'fuel';
        title: string;
        options: string[];
    } | null>(null);

    // --- VALIDATION ---
    const validatePlate = (val: string) => {
        const trimmedVal = val.trim();

        if (!trimmedVal) {
            return 'Numărul de înmatriculare este obligatoriu.';
        }

        // Explicitly checks for real Romanian county abbreviations
        const strictPlateRegex = /^(B|AB|AR|AG|BC|BH|BN|BT|BV|BR|BZ|CS|CL|CJ|CT|CV|DB|DJ|GL|GR|GJ|HR|HD|IL|IS|IF|MM|MH|MS|NT|OT|PH|SM|SJ|SB|SV|TR|TM|TL|VS|VL|VN)[\s-]?[0-9]{2,3}[\s-]?[A-Z]{3}$/i;

        if (!strictPlateRegex.test(trimmedVal)) {
            return 'Format invalid sau județ inexistent.';
        }

        return '';
    };
    const validateMake = (val: string) => !val.trim() ? 'Marca este obligatorie.' : '';
    const validateModel = (val: string) => !val.trim() ? 'Modelul este obligatoriu.' : '';
    const validateYear = (val: string) => !val.trim() ? 'Anul de fabricație este obligatoriu' : '';
    const validateFuel = (val: string) => !val.trim() ? 'Tipul combustibilului este obligatoriu' : '';

    const cleanPlate = (val: string) => val.toUpperCase().replace(/[\s-]/g, '');

    // --- HANDLERS ---
    const handleNext = async () => {
        if (step === 1) {
            setNextClicked(prev => { const n = [...prev]; n[0] = true; return n; });

            const plateErr = validatePlate(formData.plateNr);
            const makeErr = validateMake(formData.make);
            const modelErr = validateModel(formData.model);
            const yearErr = validateYear(formData.year);
            const fuelErr = validateFuel(formData.fuel);

            setFormErrors({ plate: plateErr, make: makeErr, model: modelErr, year: yearErr, fuel: fuelErr });

            if (plateErr || makeErr || modelErr || yearErr || fuelErr) {
                return; // Stop if errors
            }
            setStep(2);
        } else {

            const payloadToSave = {
                ...formData,
                plateNr: cleanPlate(formData.plateNr)
            };

            setFormData(payloadToSave);

            let resp;
            if (id) {
                resp = await updateCar(Array.isArray(id) ? id[0] : id, payloadToSave);
            } else {
                resp = await addCar(payloadToSave);
            }

            if (resp.success) {
                setSnackbar({
                    visible: true,
                    message: id ? 'Mașina a fost actualizată cu succes!' : 'Mașina a fost adăugată cu succes!'
                });
                
                if(origin === 'appointment') {
                    router.push("/(client)/add-appointment");
                } else if(origin === 'documents') {
                    router.push("/(client)/documents");
                } else if(origin === 'home') {
                    router.push("/(client)/(tabs)/home");
                } else if(origin === 'garage') {
                    router.push("/(client)/my-garage");
                }
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

    const handleSelectOption = (value: string) => {
        if (!selectionModal) return;

        setFormData(prev => ({ ...prev, [selectionModal.type]: value }));
        setFormErrors(prev => ({ ...prev, [selectionModal.type]: '' }));

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
                        placeholder="EX: B123ABC"
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
                        label="An fabricație*"
                        placeholder="An"
                        value={formData.year}
                        error={formErrors.year}
                        onPress={() => openModal('year')}
                    />
                    <SelectInput
                        label="Combustibil*"
                        placeholder="Tip"
                        value={formData.fuel}
                        error={formErrors.fuel}
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
                            value={formData.itpDate ? format(formData.itpDate, 'dd.MM.yyyy') : ''}
                            onPress={() => showDatePicker("itpDate")}
                        />
                        <SelectInput
                            label="Expirare RCA"
                            placeholder="Alege data"
                            value={formData.rcaDate ? format(formData.rcaDate, 'dd.MM.yyyy') : ''}
                            onPress={() => showDatePicker("rcaDate")}
                        />
                        <SelectInput
                            label="Expirare Rovinietă"
                            placeholder="Alege data"
                            value={formData.rovinietaDate ? format(formData.rovinietaDate, 'dd.MM.yyyy') : ''}
                            onPress={() => showDatePicker("rovinietaDate")}
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
                                <Text style={[styles.headerTitle, { color: theme.colors.text.main }]}>{id ? 'Editează mașina' : 'Adaugă mașină'}</Text>
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
                    {error && <ErrorMessage message={error} />}
                </View>

                {/* SELECTION MODAL (Used for Make, Year, Fuel) */}
                {selectionModal && (

                    <TouchableWithoutFeedback onPress={() => setSelectionModal(null)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                                    <View style={styles.modalHeader}>
                                        <Text style={[styles.modalTitle, { color: theme.colors.text.main }]}>{selectionModal.title}</Text>
                                        <TouchableOpacity onPress={() => setSelectionModal(null)} style={{ padding: 4 }}>
                                            <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
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
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
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


            {/* --- ADD THE DATE PICKER MODAL HERE --- */}
            {/* --- CUSTOM DATE PICKER OVERLAY --- */}
            {isDatePickerVisible && (
                <TouchableWithoutFeedback onPress={() => setDatePickerVisibility(false)}>
                    <View style={styles.modalOverlay}>

                        {/* Inner wrapper catches clicks so they don't close the overlay */}
                        <TouchableWithoutFeedback>
                            <View style={[
                                styles.modalContainer,
                                { backgroundColor: theme.colors.surface, padding: 20, width: '90%', maxWidth: 400 }
                            ]}>

                                <DateTimePicker
                                    mode="single"
                                    date={tempDate}
                                    onChange={(params: any) => {
                                        if (params.date) setTempDate(new Date(params.date));
                                    }}
                                    styles={{
                                        ...defaultStyles,
                                        header: {
                                            color: theme.colors.text.main,
                                            fontWeight: 'bold'
                                        },
                                        weekday_label: { color: theme.colors.text.muted },
                                        day_label: { color: theme.colors.text.main },
                                        selected: { backgroundColor: theme.colors.primary },
                                        selected_label: { color: '#FFFFFF', fontWeight: 'bold' },
                                    }}

                                />

                                <TouchableOpacity
                                    onPress={handleConfirmDate}
                                    style={{
                                        backgroundColor: theme.colors.primary,
                                        padding: 12,
                                        borderRadius: 8,
                                        marginTop: 10,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Confirmă</Text>
                                </TouchableOpacity>

                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </TouchableWithoutFeedback>
            )}
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