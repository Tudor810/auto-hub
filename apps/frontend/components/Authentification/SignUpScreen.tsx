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
      case 'customer': return 'Customer';
      case 'provider': return 'Service Provider';
      default: return 'Select your role...';
    }
  };


  const validateFullName = (name: string) => !name.trim() ? 'Please enter your full name.' : '';
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Please enter your phone number.';
    return /^(\+40|0)\s?[7]\d{2}\s?\d{3}\s?\d{3}$/.test(phone) ? '' : 'Please enter a valid phone number (+40 xxx xxx xxx).';
  };
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Please enter your email address.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.';
  };
  const validatePassword = (pass: string) => {
    if (!pass.trim()) return 'Please enter your password.';
    return pass.length < 8 ? 'Password must be at least 8 characters long.' : '';
  };
  const validateConfirmPassword = (pass: string, confirm: string) => {
    if (!confirm.trim()) return 'Please confirm your password.';
    return pass !== confirm ? 'Passwords do not match.' : '';
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
    const termsErr = !terms ? 'You must agree to the Terms of Service.' : '';

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
        setError(responseData.message || 'Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('An unexpected error occurred. Please try again.');
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
            <Text variant="bodyMedium" style={styles.goBackText}>Back to sign in</Text>
          </TouchableOpacity>
        </Link>

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Create your account</Text>

        {/* Form Container */}
        <View style={styles.formContainer}>

          {/* 1. Register As Dropdown (The standard RNP implementation) */}
          <Text variant="titleSmall" style={styles.inputLabel}>Register as</Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            contentStyle={styles.menuContent}

            anchor={
              <TouchableOpacity onPress={openMenu} activeOpacity={1} style = {{marginBottom: theme.spacing.sm}}>
                <TextInput
                  {...inputProps}
                  placeholder="Select your role..."
                  value={getRoleLabel()}
                  editable={false}
                  // 1. We force the colors to ignore the "disabled" state
                  theme={{
                    ...inputProps.theme,
                    colors: {
                      ...inputProps.theme.colors,
                      // This forces the placeholder/label color to match your theme
                      onSurfaceVariant: theme.colors.text.placeholder,
                      // This forces the value text (once selected) to be dark
                      onSurface: role ? theme.colors.text.main : theme.colors.text.placeholder,
                    }
                  }}
                  // 2. Ensure the placeholder color is explicitly set here too
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
            <Menu.Item titleStyle={{ color: theme.colors.text.main }} onPress={() => { setRole('customer'); closeMenu(); }} title="Customer (Finding Services)" />
            <Menu.Item titleStyle={{ color: theme.colors.text.main }} onPress={() => { setRole('provider'); closeMenu(); }} title="Service Provider (Offering Services)" />
          </Menu>

          {/* Conditional Common Fields (Shown once a role is selected) */}
          {role && (
            <>
              <Text variant="titleSmall" style={styles.inputLabel}>Full Name</Text>
              <TextInput
                {...fullNameInputProps}
                placeholder="Your Full Name"
                value={fullName}
                onChangeText={(text) => { handleNameChange(text) }}
                left={<TextInput.Icon icon={() => <Feather name="user" size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!fullNameError}>
                {fullNameError}
              </HelperText>

              <Text variant="titleSmall" style={styles.inputLabel}>Phone Number</Text>
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
                placeholder="you@example.com"
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
              <Text variant="titleSmall" style={styles.inputLabel}>Password</Text>
              <TextInput
                {...passwordInputProps}
                placeholder="Min. 8 characters"
                secureTextEntry={!seePassword}
                value={password}
                onChangeText={(text) => { handlePasswordChange(text); }}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
                right={<TextInput.Icon onPress={() => setSeePassword(!seePassword)} icon={() => <Feather name={seePassword ? "eye" : "eye-off"} size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>

              <Text variant="titleSmall" style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                {...confirmPasswordInputProps}
                placeholder="Re-enter password"
                secureTextEntry={!seeConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => handleConfirmPasswordChange(text)}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
                right={<TextInput.Icon onPress={() => setSeeConfirmPassword(!seeConfirmPassword)} icon={() => <Feather name={seeConfirmPassword ? "eye" : "eye-off"} size={20} color={theme.colors.text.placeholder} />} />}
              />
              <HelperText type="error" visible={!!confirmPasswordError}>
                {confirmPasswordError}
              </HelperText>

              {/* Terms Checkbox (Usually relevant for sign-up) */}
              <View style={styles.termsContainer}>
                <Feather onPress={() => { setTerms(prevState => !prevState); setTermsError(''); }} name={terms ? "check-square" : "square"} size={16} color={terms ? theme.colors.primary : theme.colors.text.placeholder} />
                <Text variant="bodySmall" style={styles.termsText}>
                  I agree to the <Link href={"/terms"} style={styles.termsLink}>Terms of Service</Link> and <Link href={"/privacy"} style={styles.termsLink}>Privacy Policy</Link>.
                </Text>
              </View>
              <HelperText type="error" visible={!!termsError}>
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
                Create account
              </Button>
              {error && (
                <ErrorMessage message={error} />
              )}
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
    marginBottom: theme.spacing.xl, // Increased margin from wireframe
  },
  formContainer: {
    width: '100%',
  },
  menuContent: {
    backgroundColor: theme.colors.surface, // Ensure dropdown stays white
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
    paddingRight: 20 // Stop text from clashing on very narrow devices
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