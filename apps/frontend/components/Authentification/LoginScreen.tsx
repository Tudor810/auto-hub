import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button, HelperText, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useInputProps } from '@/hooks/useInputProps';
import { IAuthSuccessResponse, ILoginRequest } from '@auto-hub/shared/types/userTypes';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import ErrorMessage from '../ErrorMessage';
import { API_BASE_URL } from '@/utils/api';


export default function LoginScreen() {

  const { login } = useAuth();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 450;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [signInPressed, setSignInPressed] = useState(false)
  const [seePassword, setSeePassword] = useState(false);

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Please enter your email address.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.';
  };
  const validatePassword = (pass: string) => {
    if (!pass.trim()) return 'Please enter your password.';
    return pass.length < 8 ? 'Password must be at least 8 characters long.' : '';
  };

   const handleEmailChange = (text: string) => {
    setEmail(text);
    if (signInPressed) setEmailError(validateEmail(text));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (signInPressed) setPasswordError(validatePassword(text));
  }
  

  const handleSignIn = async () => {

    setSignInPressed(true);
    setError('');

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) {
      return;
    }

    try {

      const payload : ILoginRequest = { email, password };

      const data = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const responseData : IAuthSuccessResponse = await data.json();

      if(data.ok) {
        await login(responseData.user, responseData.token); // Save to context and storage
        router.replace('/'); 
      } else {
        console.log(responseData);
        setError(responseData.message || 'Login failed. Please try again.');
        return
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setEmailError('');
    setPasswordError('');
  };


  const emailInputProps = useInputProps(undefined, !!emailError);
  const passwordInputProps = useInputProps(undefined, !!passwordError);
  const theme = useTheme<any>();
  const styles = makeStyles(theme);
  const logoLight = require("../../assets/images/logo_light.png");
  const logoDark = require("../../assets/images/logo_dark.png");
  return (
    // 2. Replace KeyboardAvoidingView & ScrollView with KeyboardAwareScrollView
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // 3. This tells the view how much extra space to put between the keyboard and the input
      extraScrollHeight={20}
      enableOnAndroid={true}
    >
      <View style={{ flex: 1, minHeight: 20 }} />
      
      <Surface style={styles.card} elevation={Platform.OS === 'android' ? 2 : 0}>
        
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Image 
              source={theme.theme === 'dark' ? logoDark : logoLight} 
              style={{ width: 130, height: 130 }} 
            />
          </View>
        </View>

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Welcome to AutoHub</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Sign in to continue</Text>

        {/* Google Sign In Button */}
        <GoogleSignInButton setError={(message) => setError(message)}/>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text variant="labelSmall" style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text variant="titleSmall" style={styles.inputLabel}>Email</Text>
          <TextInput
            {...emailInputProps}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={handleEmailChange}
            left={<TextInput.Icon icon={() => <Feather name="mail" size={20} color={theme.colors.text.placeholder} />} />}
          />
          <HelperText type="error" visible={!!emailError}>
            {emailError}
          </HelperText>
          <Text variant="titleSmall" style={styles.inputLabel}>Password</Text>
          <TextInput
            {...passwordInputProps}
            placeholder="••••••••" 
            secureTextEntry={!seePassword}
            value={password}
            onChangeText={handlePasswordChange}
            left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
             right={<TextInput.Icon onPress = {() => setSeePassword(!seePassword)} icon={() => <Feather name = {seePassword ? "eye" : "eye-off"} size = {20} color={theme.colors.text.placeholder} />} />} 
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSignIn}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.primaryText}
            style={styles.signInButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.signInButtonText}
          >
            Sign in
          </Button>
          {error && (
            <ErrorMessage message={error} />
          )}
        </View>

        {/* Footer Links */}
    <View style={[
      styles.footer, 
      isSmallScreen && styles.footerStacked // Apply vertical layout if small
    ]}>
      <TouchableOpacity >
        <Text variant="bodyMedium" style={styles.footerLink}>Forgot password?</Text>
      </TouchableOpacity>
      
        <Link href={"/sign-up"} asChild>
          <TouchableOpacity>
            <Text variant="bodyMedium" style={styles.footerText}>
              Need an account? <Text style={styles.footerLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
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
    ...theme.shadows.card,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.logo.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.logo.border,
  },
  title: {
    fontWeight: '700',
    color: theme.colors.text.main,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonContent: {
    height: 48,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    marginHorizontal: theme.spacing.sm,
    color: theme.colors.text.placeholder,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
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
  signInButton: {
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  footerStacked: {
    flexDirection: 'column', 
    alignItems: 'center',   
    justifyContent: 'center',
    gap: 0,                
  },
  footerText: {
    color: theme.colors.text.muted,
    textAlign: 'center',     
  },
  footerLink: {
    color: theme.colors.text.link,
    fontWeight: '600',
  },
  footerLinkBold: {
    color: theme.colors.text.main,
    fontWeight: '700',
  },
});