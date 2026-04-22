import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  Modal, 
  KeyboardAvoidingView, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, TextInput, HelperText } from 'react-native-paper';
import { ICompanyFormData } from '@auto-hub/shared/types/companyTypes';
import { useInputProps } from "../../hooks/useInputProps";
import ErrorMessage from '../ErrorMessage';

interface EditCompanyModalProps {
  visible: boolean;
  onClose: () => void;
  initialData: ICompanyFormData;
  onSave: (updatedData: ICompanyFormData) => void;
  isClosable?: boolean;
  error: string;
}

export default function EditCompanyModal({ visible, onClose, initialData, onSave, isClosable = true, error }: EditCompanyModalProps) {
  const theme = useTheme<any>();

  const [saveButton, setSaveButton] = useState(false);

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
    return /^(\+40|0)\s?[7]\d{2}\s?\d{3}\s?\d{3}$/.test(phone) ? '' : 'Număr de telefon invalid.';
  };

  const validateCUI = (cui: string) => {
    if (!cui.trim()) return 'Introduceți CUI-ul sau CIF-ul.';
    return /^(RO)?\s?[0-9]{2,10}$/i.test(cui) ? '' : 'CUI invalid (ex: RO12345678).';
  };

  const validateRegCom = (regCom: string) => {
    if (!regCom.trim()) return 'Introduceți Nr. Înreg. la Registrul Comerțului.';
    return /^[JFCjfc][0-9]{1,2}\/[0-9]+\/[0-9]{4}$/.test(regCom) ? '' : 'Format invalid (ex: J12/345/2020).';
  };

  const handleClose = () => {
    setSaveButton(false);
    setErrors({ name: '', admin: '', email: '', phone: '', cui: '', regCom: '' });
    onClose();
  };

  const handleValidateAndSave = () => {
    setSaveButton(true);
    const nameErr = validateName(formData.name);
    const adminErr = validateAdmin(formData.admin);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const cuiErr = validateCUI(formData.cui);
    const regComErr = validateRegCom(formData.regCom);

    setErrors({ name: nameErr, admin: adminErr, email: emailErr, phone: phoneErr, cui: cuiErr, regCom: regComErr });

    if (nameErr || adminErr || emailErr || phoneErr || cuiErr || regComErr) {
      return;
    }

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => { if (isClosable) handleClose(); }}
    >
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
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

            {/* Buton de acțiune */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleValidateAndSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Salvează Modificările</Text>
            </TouchableOpacity>
            
            {error ? <ErrorMessage message={error} /> : null}

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center', // Centers the modal vertically
    alignItems: 'center',     // Centers the modal horizontally
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 24,         // Rounded on all corners now, just like AddServiceModal
    paddingTop: 24,
    paddingBottom: 24,
    maxHeight: '90%',         // Ensures it doesn't overflow off the screen
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingHorizontal: 24,    // Moved horizontal padding to elements inside the container
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700' 
  },
  scrollContent: {
    paddingHorizontal: 24,    // Padding for the scrolling area
    paddingBottom: 20,
  },
  inputWrapper: { marginBottom: 4 },
  rowContainer: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  flexHalf: { flex: 1 },
  helperText: { marginTop: -4, paddingHorizontal: 4 },
  saveBtn: { 
    marginTop: 16, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  saveBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});