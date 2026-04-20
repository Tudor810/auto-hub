// screens/SignUpScreen.tsx
import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Menu, Surface, Text, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useInputProps } from '@/hooks/useInputProps';
import ErrorMessage from '../ErrorMessage';
import { IAuthSuccessResponse, ISignUpRequest } from '@auto-hub/shared/types/userTypes';
import { API_BASE_URL } from '@/utils/api';

export default function SignUpScreen() {
  const router = useRouter();
  const { login } = useAuth();

  // -- Form State --
  const [role, setRole] = useState<'customer' | 'provider' | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [signUpPressed, setSignUpPressed] = useState(false);
  const [error, setError] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);

  // -- Role Selector Menu State --
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const getRoleLabel = () => {
    switch (role) {
      case 'customer': return 'Client';
      case 'provider': return 'Service Auto';
      default: return 'Selectează rolul tău...';
    }
  };

  const validateFullName = (name: string) => !name.trim() ? 'Te rugăm să introduci numele complet.' : '';
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Te rugăm să introduci numărul de telefon.';
    return /^(\+40|0)\s?[7]\d{2}\s?\d{3}\s?\d{3}$/.test(phone) ? '' : 'Te rugăm să introduci un număr valid (+40 xxx xxx xxx).';
  };
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Te rugăm să introduci adresa de email.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Te rugăm să introduci o adresă de email validă.';
  };
  const validatePassword = (pass: string) => {
    if (!pass.trim()) return 'Te rugăm să introduci parola.';
    return pass.length < 8 ? 'Parola trebuie să aibă cel puțin 8 caractere.' : '';
  };
  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm.trim()) return 'Te rugăm să confirmi parola.';
    return pass !== confirm ? 'Parolele nu coincid.' : '';
  };

  const handleSignUp = () => {
    handleSignUpAsync(role, fullName, phoneNumber, email, password, confirmPassword, terms);
  };

  const handleNameChange = (text: string) => {
    setFullName(text);
    if (signUpPressed) setFullNameError(validateFullName(text));
  };
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (signUpPressed) setEmailError(validateEmail(text));
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    if (signUpPressed) setPhoneNumberError(validatePhone(text));
  }

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (signUpPressed) setConfirmPasswordError(validateConfirmPassword(password, text));
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (signUpPressed) setPasswordError(validatePassword(text));
  }

  const handleSignUpAsync = async (role: string | null, fullName: string, phoneNumber: string, email: string, password: string, confirmPassword: string, terms: boolean) => {
    console.log('Signing up with:', { role, fullName, phoneNumber, email, password, confirmPassword, terms });

    setSignUpPressed(true);
    setError('')

    const nameErr = validateFullName(fullName);
    const phoneErr = validatePhone(phoneNumber);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    const termsErr = !terms ? 'Trebuie să accepți Termenii și Condițiile.' : '';

    setFullNameError(nameErr);
    setPhoneNumberError(phoneErr);
    setEmailError(emailErr);
    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);
    setTermsError(termsErr);

    if (nameErr || phoneErr || emailErr || passErr || confirmErr || termsErr) {
      return;
    }
    
    try {
      const paylod: ISignUpRequest = {
        role: role as 'customer' | 'provider',
        fullName: fullName,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
        termsAccepted: terms
      }
      
      const data = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(paylod)
      });

      const responseData: IAuthSuccessResponse = await data.json();

      if (data.ok) {
        await login(responseData.user, responseData.token); // Save to context and storage
        router.replace('/');
      } else {
        setError(responseData.message || 'Înregistrarea a eșuat. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
    }
  }

  // Reusable text field prop object to apply global styles easily
  const inputProps = useInputProps();
  const emailInputProps = useInputProps(undefined, !!emailError);
  const fullNameInputProps = useInputProps(undefined, !!fullNameError);
  const phoneNumberInputProps = useInputProps(undefined, !!phoneNumberError);
  const passwordInputProps = useInputProps(undefined, !!passwordError);
  const confirmPasswordInputProps = useInputProps(undefined, !!confirmPasswordError);
  const theme = useTheme<any>();
  const styles = makeStyles(theme);

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
      enableOnAndroid={true}
    >
      <View style={{ flex: 1, minHeight: 20 }} />

      <Surface style={styles.card} elevation={Platform.OS === 'android' ? 2 : 0}>

        {/* Centralized Back to Sign In Link */}
        <Link href="/" asChild>
          <TouchableOpacity style={styles.goBackButton}>
            <Feather name="arrow-left" size={20} color={theme.colors.text.secondary} />
            <Text variant="bodyMedium" style={styles.goBackText}>Înapoi la autentificare</Text>
          </TouchableOpacity>
        </Link>

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Creează un cont</Text>

        {/* Form Container */}
        <View style={styles.formContainer}>

          {/* 1. Register As Dropdown */}
          <Text variant="titleSmall" style={styles.inputLabel}>Înregistrează-te ca</Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            contentStyle={styles.menuContent}
            anchor={
              <TouchableOpacity onPress={openMenu} activeOpacity={1} style={{ marginBottom: theme.spacing.sm }}>
                <TextInput
                  {...inputProps}
                  placeholder="Selectează rolul tău..."
                  value={getRoleLabel()}
                  editable={false}
                  theme={{
                    ...inputProps.theme,
                    colors: {
                      ...inputProps.theme.colors,
                      onSurfaceVariant: theme.colors.text.placeholder,
                      onSurface: role ? theme.colors.text.main : theme.colors.text.placeholder,
                    }
                  }}
                  placeholderTextColor={theme.colors.text.placeholder}
                  left={
                    <TextInput.Icon
                      icon={() => <Feather name="users" size={20} color={theme.colors.text.placeholder} />}
                    />
                  }
                  right={
                    <TextInput.Icon
                      onPress={openMenu}
                      icon={() => (
                        <Feather
                          name="chevron-down"
                          size={20}
                          color={theme.colors.text.placeholder}
                        />
                      )}
                    />
                  }
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item titleStyle={{ color: theme.colors.text.main }} onPress={() => { setRole('customer'); closeMenu(); }} title="Client (Caut service-uri)" />
            <Menu.Item titleStyle={{ color: theme.colors.text.main }} onPress={() => { setRole('provider'); closeMenu(); }} title="Service Auto (Ofer servicii)" />
          </Menu>

          {/* Conditional Common Fields */}
          {role && (
            <>
              <Text variant="titleSmall" style={styles.inputLabel}>Nume Complet</Text>
              <TextInput
                {...fullNameInputProps}
                placeholder="Numele tău complet"
                value={fullName}
                onChangeText={(text) => { handleNameChange(text) }}
                left={<TextInput.Icon icon={() => <Feather name="user" size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!fullNameError}>
                {fullNameError}
              </HelperText>

              <Text variant="titleSmall" style={styles.inputLabel}>Număr de Telefon</Text>
              <TextInput
                {...phoneNumberInputProps}
                placeholder="+40 7xx xxx xxx"
                value={phoneNumber}
                onChangeText={(text) => { handlePhoneNumberChange(text) }}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon={() => <Feather name="phone" size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!phoneNumberError}>
                {phoneNumberError}
              </HelperText>

              <Text variant="titleSmall" style={styles.inputLabel}>Email</Text>
              <TextInput
                {...emailInputProps}
                placeholder="tu@exemplu.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => { handleEmailChange(text); }}
                left={<TextInput.Icon icon={() => <Feather name="mail" size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!emailError}>
                {emailError}
              </HelperText>
            </>
          )}

          {role && (
            <>
              <Text variant="titleSmall" style={styles.inputLabel}>Parolă</Text>
              <TextInput
                {...passwordInputProps}
                placeholder="Min. 8 caractere"
                secureTextEntry={!seePassword}
                value={password}
                onChangeText={(text) => { handlePasswordChange(text); }}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
                right={<TextInput.Icon onPress={() => setSeePassword(!seePassword)} icon={() => <Feather name={seePassword ? "eye" : "eye-off"} size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>

              <Text variant="titleSmall" style={styles.inputLabel}>Confirmă Parola</Text>
              <TextInput
                {...confirmPasswordInputProps}
                placeholder="Introdu din nou parola"
                secureTextEntry={!seeConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => handleConfirmPasswordChange(text)}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
                right={<TextInput.Icon onPress={() => setSeeConfirmPassword(!seeConfirmPassword)} icon={() => <Feather name={seeConfirmPassword ? "eye" : "eye-off"} size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!confirmPasswordError}>
                {confirmPasswordError}
              </HelperText>

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <Feather onPress={() => { setTerms(prevState => !prevState); setTermsError(''); }} name={terms ? "check-square" : "square"} size={16} color={terms ? theme.colors.primary : theme.colors.text.placeholder} />
                <Text variant="bodySmall" style={styles.termsText}>
                  Sunt de acord cu <Link href={"/terms"} style={styles.termsLink}>Termenii și Condițiile</Link> și cu <Link href={"/privacy"} style={styles.termsLink}>Politica de Confidențialitate</Link>.
                </Text>
              </View>
              <HelperText style={{ marginTop: -30, marginBottom: 25 }} type="error" visible={!!termsError}>
                {termsError}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleSignUp}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.primaryText}
                style={styles.signInButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.signInButtonText}
              >
                Creează contul
              </Button>
              {error ? (
                <ErrorMessage message={error} />
              ) : null}
            </>
          )}

        </View>

      </Surface>

      <View style={{ flex: 1, minHeight: 20 }} />
    </KeyboardAwareScrollView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: '100%'
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    width: '100%',
    maxWidth: 500,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.xl,
    ...theme.shadows.card
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: 8,
    alignSelf: 'flex-start'
  },
  goBackText: {
    color: theme.colors.text.secondary,
    fontWeight: '600'
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text.main,
    textAlign: 'center',
    marginBottom: theme.spacing.xl, 
  },
  formContainer: {
    width: '100%',
  },
  menuContent: {
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.borderRadius.input,
    marginTop: 50,
  },
  inputLabel: {
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  input: {
    marginBottom: theme.spacing.sm,
    fontSize: 15,
    height: 48,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    gap: 10,
    paddingRight: 20 
  },
  termsText: {
    color: theme.colors.text.muted,
    lineHeight: 18
  },
  termsLink: {
    fontWeight: '700',
    color: theme.colors.text.main,
    textDecorationLine: 'underline'
  },
  buttonContent: {
    height: 48,
  },
  signInButton: {
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});