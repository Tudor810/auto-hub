import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Switch,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import { TextInput, useTheme, HelperText, Menu, Provider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useInputProps } from '@/hooks/useInputProps'; // Adjust path if needed
import { IServiceFormData, IService, ServiceCategory } from '@auto-hub/shared/types/serviceTypes'
import ErrorMessage from '../ErrorMessage';


interface AddServiceModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (serviceData: IServiceFormData) => void;
    categories: ServiceCategory[];
    serviceToEdit?: IService | null;
    error: string
}

export default function AddServiceModal({ visible, onClose, onSave, categories, serviceToEdit, error }: AddServiceModalProps) {
    const theme = useTheme<any>();

    const textAreaProps = useInputProps({ height: 100 }, false);

    // Form State
    const [formData, setFormData] = useState<IServiceFormData>({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        isActive: false
    });

    const [errors, setErrors] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: ''
    })
    const [saveButton, setSaveButton] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [menuWidth, setMenuWidth] = useState(0);


    useEffect(() => {
        if (visible) {
            if (serviceToEdit) {
                // Fill the form with existing data
                setFormData({
                    name: serviceToEdit.name,
                    description: serviceToEdit.description || '',
                    price: serviceToEdit.price.toString(), // Convert numbers back to strings for TextInputs
                    duration: serviceToEdit.duration.toString(),
                    category: serviceToEdit.category,
                    isActive: serviceToEdit.isActive
                });
            } else {
                // Reset form for a completely new service
                setFormData({ name: '', description: '', price: '', duration: '', category: '', isActive: false });
            }
            // Clear any lingering visual errors
            setErrors({ name: '', description: '', price: '', duration: '', category: '' });
            setSaveButton(false);
        }
    }, [visible, serviceToEdit]);

    const validateName = (name: string) =>
        !name.trim() ? 'Introduceți numele serviciului.' : '';

    const validatePrice = (price: string) => {
        if (!price.trim()) return 'Introduceți prețul.';
        const num = parseFloat(price);
        return isNaN(num) || num < 0 ? 'Prețul trebuie să fie un număr valid (ex: 100).' : '';
    };

    const validateDuration = (duration: string) => {
        // Assuming duration is optional. If required, add: if (!duration.trim()) return 'Introduceți durata.';
        if (!duration.trim()) return 'Introduceți durata';
        const num = parseInt(duration, 10);
        return isNaN(num) || num <= 0 ? 'Durată invalidă.' : '';
    };

    const validateCategory = (category: string) =>
        !category.trim() ? 'Selectați o categorie.' : '';

    const handleClose = () => {
        setErrors({
            name: '',
            description: '',
            price: '',
            duration: '',
            category: ''
        })
        onClose();
    }
    const handleValidateAndSave = () => {
        setSaveButton(true);

        // 1. Run Validations
        const nameErr = validateName(formData.name);
        const priceErr = validatePrice(formData.price);
        const durationErr = validateDuration(formData.duration);
        const categoryErr = validateCategory(formData.category);

        // 2. Update Error State
        setErrors({
            name: nameErr,
            description: '', // No validation for description since it's optional
            price: priceErr,
            duration: durationErr,
            category: categoryErr
        });

        // 3. Stop if any errors exist
        if (nameErr || priceErr || durationErr || categoryErr) {
            return;
        }

        // 4. Save and Reset
        onSave(formData);

        // Reset everything
        setFormData({ name: '', description: '', price: '', duration: '', category: '', isActive: false });
        setSaveButton(false);
        setErrors({ name: '', description: '', price: '', duration: '', category: '' });
        onClose();
    };

    const nameInputProps = useInputProps(undefined, !!errors.name);
    const priceInputProps = useInputProps(undefined, !!errors.price);
    const durationInputProps = useInputProps(undefined, !!errors.name);
    const categoryInputProps = useInputProps(undefined, !!errors.category);


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Provider theme={theme}>
                <KeyboardAvoidingView
                    style={styles.overlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Notice the dark background color applied here to match your image */}
                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>

                        {/* HEADER */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text.main }]}>
                                {serviceToEdit ? 'Editează serviciu' : 'Serviciu nou'}
                            </Text>
                            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
                                <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                            {/* NUME SERVICIU */}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    {...nameInputProps}
                                    label="Nume serviciu *"
                                    placeholder="ex: Schimb ulei și filtru"
                                    value={formData.name}
                                    onChangeText={(t) => {
                                        setFormData({ ...formData, name: t });
                                        if (saveButton) setErrors(prev => ({ ...prev, name: validateName(t) }));
                                    }}
                                />
                                <HelperText type="error" visible={!!errors.name} style={styles.helperText}>{errors.name}</HelperText>
                            </View>

                            {/* DESCRIERE (Optional, no validation) */}
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    {...textAreaProps}
                                    label="Descriere"
                                    placeholder="Descriere detaliată a serviciului..."
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    contentStyle={{ paddingTop: 16, paddingBottom: 16 }}
                                    value={formData.description}
                                    onChangeText={(t) => setFormData({ ...formData, description: t })}
                                />
                            </View>

                            {/* ROW: PREȚ & DURATĂ */}
                            <View style={styles.rowContainer}>
                                <View style={styles.flexHalf}>
                                    <TextInput
                                        {...priceInputProps}
                                        label="Preț (RON) *"
                                        placeholder="100"
                                        keyboardType="numeric"
                                        value={formData.price}
                                        onChangeText={(t) => {
                                            setFormData({ ...formData, price: t });
                                            if (saveButton) setErrors(prev => ({ ...prev, price: validatePrice(t) }));
                                        }}
                                    />
                                    <HelperText type="error" visible={!!errors.price} style={styles.helperText}>{errors.price}</HelperText>
                                </View>

                                <View style={styles.flexHalf}>
                                    <TextInput
                                        {...durationInputProps}
                                        label="Durată (min)"
                                        placeholder="30"
                                        keyboardType="numeric"
                                        value={formData.duration}
                                        onChangeText={(t) => {
                                            setFormData({ ...formData, duration: t });
                                            if (saveButton) setErrors(prev => ({ ...prev, duration: validateDuration(t) }));
                                        }}
                                    />
                                    <HelperText type="error" visible={!!errors.duration} style={styles.helperText}>{errors.duration}</HelperText>
                                </View>
                            </View>

                            {/* CATEGORIE */}
                            <View
                                style={styles.inputWrapper}
                                // 1. Măsurăm lățimea exactă a containerului când se randează pe ecran
                                onLayout={(event) => setMenuWidth(event.nativeEvent.layout.width)}
                            >
                                <Menu
                                    visible={isMenuVisible}
                                    onDismiss={() => setIsMenuVisible(false)}

                                    // 2. Setăm lățimea Meniului (caseta albă/dark) la lățimea măsurată
                                    contentStyle={{
                                        width: menuWidth,
                                        backgroundColor: theme.colors.surface,
                                        borderRadius: 12, // Opțional: rotunjim colțurile pentru a se potrivi cu tema ta
                                    }}

                                    // 3. Împingem meniul deasupra input-ului
                                    // Calculăm: înălțimea unui item de meniu (aprox 48px) * numărul de categorii + spațiul input-ului
                                    style={{
                                        transform: [{
                                            translateY: categories.length > 0
                                                ? -(categories.length * 48) - 64
                                                : -112 // Fallback height if the list is empty
                                        }]
                                    }}

                                    anchor={
                                        <TouchableOpacity
                                            onPress={() => setIsMenuVisible(true)}
                                            activeOpacity={0.8}
                                        >
                                            <View style = {{pointerEvents: "none"}}>
                                                <TextInput
                                                    {...categoryInputProps}
                                                    label="Categorie *"
                                                    value={formData.category}
                                                    editable={false}
                                                    right={<TextInput.Icon icon={isMenuVisible ? "chevron-up" : "chevron-down"} color={theme.colors.text.placeholder} />}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    }
                                >
                                    {categories.length > 0 ? (
                                        categories.map((cat, index) => (
                                            <Menu.Item
                                                key={index}
                                                onPress={() => {
                                                    setFormData({ ...formData, category: cat });
                                                    if (saveButton) setErrors(prev => ({ ...prev, category: '' }));
                                                    setIsMenuVisible(false);
                                                }}
                                                title={cat}
                                                titleStyle={{ color: theme.colors.text.main }} // Asigură-te că textul e vizibil în Dark Mode
                                            />
                                        ))
                                    ) : (
                                        <Menu.Item disabled title="Nicio categorie definită pe locație" />
                                    )}
                                </Menu>
                                <HelperText type="error" visible={!!errors.category} style={styles.helperText}>
                                    {errors.category}
                                </HelperText>
                            </View>

                            {/* SERVICIU ACTIV SWITCH */}
                            <View style={[
                                styles.switchContainer,
                                {
                                    backgroundColor: theme.colors.background,
                                    borderColor: theme.colors.border.light,
                                    borderWidth: 1
                                }
                            ]}>
                                <View>
                                    <Text style={[styles.switchTitle, { color: theme.colors.text.main }]}>Serviciu activ</Text>
                                    <Text style={[styles.switchSubtitle, { color: theme.colors.text.muted }]}>Vizibil pentru clienți</Text>
                                </View>
                                <Switch
                                    value={formData.isActive}
                                    onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                                    trackColor={{ false: theme.colors.border.medium, true: theme.colors.primary }}
                                    thumbColor={theme.colors.surface}
                                />
                            </View>

                            {/* SUBMIT BUTTON */}
                            <TouchableOpacity
                                style={[
                                    styles.saveBtn,
                                    { backgroundColor: theme.colors.primary }
                                ]}
                                onPress={handleValidateAndSave}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.saveBtnText}>{serviceToEdit ? 'Salvează modificările' : 'Adaugă serviciu'}</Text>
                            </TouchableOpacity>
                            {error ? <ErrorMessage message={error} /> : null}

                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Provider>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 600,
        borderRadius: 24,
        paddingTop: 24,
        paddingBottom: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    flexHalf: {
        flex: 1,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
    },
    switchTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    switchSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    helperText: { marginTop: -4, paddingHorizontal: 4 },
});