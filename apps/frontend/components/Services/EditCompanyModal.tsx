import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, TextInput, HelperText } from 'react-native-paper';
import { ICompanyFormData } from '@auto-hub/shared/types/companyTypes'
import { useInputProps } from "../../hooks/useInputProps";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ErrorMessage from '../ErrorMessage';

interface EditCompanyModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: ICompanyFormData;
  onSave: (updatedData: ICompanyFormData) => void;
  isClosable?: boolean
  error: string
}

export default function EditCompanyModal({ visible, onClose, initialData, onSave, isClosable = true, error }: EditCompanyModalProps) {
  const theme = useTheme<any>();

  const [saveButton, setSaveButton] = useState(false)

  const [formData, setFormData] = useState<ICompanyFormData>(initialData);
  const [errors, setErrors] = useState({
    name: '',
    admin: '',
    email: '',
    phone: '',
    cui: '',
    regCom: ''
  });

  const validateName = (name: string) => !name.trim() ? 'Introduceți numele companiei.' : '';

  const validateAdmin = (admin: string) => !admin.trim() ? 'Introduceți numele reprezentantului.' : '';

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Introduceți adresa de email.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Adresă de email invalidă.';
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Introduceți numărul de telefon.';
    // Permite formate precum: 0722123456, 0722 123 456, +40722123456
    return /^(\+40|0)\s?[7]\d{2}\s?\d{3}\s?\d{3}$/.test(phone) ? '' : 'Număr de telefon invalid.';
  };

  const validateCUI = (cui: string) => {
    if (!cui.trim()) return 'Introduceți CUI-ul sau CIF-ul.';
    // Verifică formatul RO urmat de 2 până la 10 cifre (RO este opțional)
    return /^(RO)?\s?[0-9]{2,10}$/i.test(cui) ? '' : 'CUI invalid (ex: RO12345678).';
  };

  const validateRegCom = (regCom: string) => {
    if (!regCom.trim()) return 'Introduceți Nr. Înreg. la Registrul Comerțului.';
    // Verifică formatul clasic românesc (J, F sau C urmat de județ/număr/an) -> ex: J12/345/2020
    return /^[JFCjfc][0-9]{1,2}\/[0-9]+\/[0-9]{4}$/.test(regCom) ? '' : 'Format invalid (ex: J12/345/2020).';
  };

  const handleClose = () => {
    setSaveButton(false)
    setErrors({
      name: '',
      admin: '',
      email: '',
      phone: '',
      cui: '',
      regCom: ''
    })
    onClose();
  }
  const handleValidateAndSave = () => {
    // 1. Rulăm toate validările


    setSaveButton(true)
    const nameErr = validateName(formData.name);
    const adminErr = validateAdmin(formData.admin);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const cuiErr = validateCUI(formData.cui);
    const regComErr = validateRegCom(formData.regCom);

    // 2. Actualizăm starea de erori vizuală
    setErrors({
      name: nameErr,
      admin: adminErr,
      email: emailErr,
      phone: phoneErr,
      cui: cuiErr,
      regCom: regComErr
    });

    // 3. Verificăm dacă există MĂCAR o eroare
    if (nameErr || adminErr || emailErr || phoneErr || cuiErr || regComErr) {
      return; // Ne oprim aici, nu salvăm nimic!
    }

    // 4. Dacă totul e perfect curat, apelăm funcția de salvare primită prin Props
    onSave(formData);
    handleClose();
  };

  useEffect(() => {
    if (visible) {
      setFormData(initialData);
    }
  }, [visible, initialData]);


  const nameInputProps = useInputProps(undefined, !!errors.name);
  const adminInputProps = useInputProps(undefined, !!errors.admin);
  const emailInputProps = useInputProps(undefined, !!errors.email);
  const phoneInputProps = useInputProps(undefined, !!errors.phone);
  const cuiInputProps = useInputProps(undefined, !!errors.cui);
  const regComInputProps = useInputProps(undefined, !!errors.regCom);

  // ... inside your EditCompanyModal component

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => { if (isClosable) handleClose(); }}
    >
      <View style={styles.modalOverlay}>

        {/* Magia se întâmplă aici */}
        <KeyboardAwareScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={styles.keyboardAwareContent}
          enableOnAndroid={true}

          // FIX 1: "always" în loc de "handled" previne nevoia de dublu-click pe buton!
          keyboardShouldPersistTaps="always"

          extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
          showsVerticalScrollIndicator={false}

          // FIX 2: Blocăm complet efectul de elastic/scroll în gol pe ambele platforme
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never" // Specific pentru Android
        >
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.main }]}>
                {isClosable ? 'Editează Date Companie' : 'Configurare Profil'}
              </Text>
              {isClosable && (
                <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
                  <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Formularul direct (fără alt ScrollView intern) */}
            <View style={styles.formContainer}>

              <View style={styles.inputWrapper}>
                <TextInput
                  {...nameInputProps}
                  label="Nume Companie (Nume Comercial) *"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (saveButton) setErrors(prev => ({ ...prev, name: validateName(text) }));
                  }}
                />
                <HelperText type="error" visible={!!errors.name} style={styles.helperText}>{errors.name}</HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  {...adminInputProps}
                  label="Nume Reprezentant Legal *"
                  value={formData.admin}
                  onChangeText={(text) => {
                    setFormData({ ...formData, admin: text });
                    if (saveButton) setErrors(prev => ({ ...prev, admin: validateAdmin(text) }));
                  }}
                />
                <HelperText type="error" visible={!!errors.admin} style={styles.helperText}>{errors.admin}</HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  {...emailInputProps}
                  label="Email Contact *"
                  value={formData.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (saveButton) setErrors(prev => ({ ...prev, email: validateEmail(text) }));
                  }}
                />
                <HelperText type="error" visible={!!errors.email} style={styles.helperText}>{errors.email}</HelperText>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  {...phoneInputProps}
                  label="Telefon Contact *"
                  value={formData.phone}
                  keyboardType="phone-pad"
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (saveButton) setErrors(prev => ({ ...prev, phone: validatePhone(text) }));
                  }}
                />
                <HelperText type="error" visible={!!errors.phone} style={styles.helperText}>{errors.phone}</HelperText>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.flexHalf}>
                  <TextInput
                    {...cuiInputProps}
                    label="CUI / CIF *"
                    placeholder="RO123456"
                    value={formData.cui}
                    autoCapitalize="characters"
                    onChangeText={(text) => {
                      setFormData({ ...formData, cui: text });
                      if (saveButton) setErrors(prev => ({ ...prev, cui: validateCUI(text) }));
                    }}
                  />
                  <HelperText type="error" visible={!!errors.cui} style={styles.helperText}>{errors.cui}</HelperText>
                </View>

                <View style={styles.flexHalf}>
                  <TextInput
                    {...regComInputProps}
                    label="Nr. Reg. Com. *"
                    placeholder="J12/345/2020"
                    value={formData.regCom}
                    autoCapitalize="characters"
                    onChangeText={(text) => {
                      setFormData({ ...formData, regCom: text });
                      if (saveButton) setErrors(prev => ({ ...prev, regCom: validateRegCom(text) }));
                    }}
                  />
                  <HelperText type="error" visible={!!errors.regCom} style={styles.helperText}>{errors.regCom}</HelperText>
                </View>
              </View>
            </View>

            {/* Buton de acțiune */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleValidateAndSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Salvează Modificările</Text>
            </TouchableOpacity>
            {error && <ErrorMessage message={error} />}
          </View>

        </KeyboardAwareScrollView>

      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    // Am șters justifyContent și alignItems de aici, se ocupă KeyboardAwareScrollView
  },

  // NOU: Containerul intern pentru ScrollView
  keyboardAwareContent: {
    flexGrow: 1,
    justifyContent: 'flex-end', // Împinge mereu modalul în jos
    alignItems: 'center',       // Centrează modalul pe orizontală (pentru tablete/web)
  },

  modalContainer: {
    width: '100%',
    maxWidth: 600,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Platform.select({
      web: { borderRadius: 24, marginBottom: 'auto', marginTop: 'auto', boxShadow: '0px 10px 40px rgba(0,0,0,0.3)' } as any,
    })
  },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },

  formContainer: { width: '100%', marginTop: 8 },
  inputWrapper: { marginBottom: 4 },
  rowContainer: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  flexHalf: { flex: 1 },
  helperText: { marginTop: -4, paddingHorizontal: 4 },

  saveBtn: { marginTop: 16, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});