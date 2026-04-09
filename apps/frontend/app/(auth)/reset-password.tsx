import { Feather } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
} from 'react-native';

import { Button, HelperText, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useInputProps } from '@/hooks/useInputProps';
import ErrorMessage from "@/components/ErrorMessage";

import { API_BASE_URL } from '@/utils/api';

export default function ResetPasswordScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  // Extragem token-ul din URL (deep link)
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');
  
  const [submitPressed, setSubmitPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Opțional, pentru a ascunde/afișa parola
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const validatePassword = (pass: string) => {
    if (!pass) return 'Te rugăm să introduci noua parolă.';
    if (pass.length < 8) return 'Parola trebuie să aibă minim 8 caractere.';
    return '';
  };

  const validateConfirmPassword = (pass: string, confirmPass: string) => {
    if (!confirmPass) return 'Te rugăm să confirmi parola.';
    if (pass !== confirmPass) return 'Parolele nu coincid.';
    return '';
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (submitPressed) {
      setPasswordError(validatePassword(text));
      if (confirmPassword) {
        setConfirmPasswordError(validateConfirmPassword(text, confirmPassword));
      }
    }
    setError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (submitPressed) {
      setConfirmPasswordError(validateConfirmPassword(password, text));
    }
    setError('');
  };

  const handleSubmit = async () => {
    setSubmitPressed(true);
    setError('');

    const passErr = validatePassword(password);
    const confirmPassErr = validateConfirmPassword(password, confirmPassword);

    setPasswordError(passErr);
    setConfirmPasswordError(confirmPassErr);

    if (passErr || confirmPassErr) {
      return;
    }

    if (!token) {
      setError('Link-ul de resetare este invalid. Te rugăm să ceri un link nou.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, newPassword: password })
      });

      console.log(data);
      
      if (data.ok) {

        setSuccessMessage("Parola ta a fost resetată cu succes. Te poți autentifica acum cu noua parolă.")
        setTimeout(() => {
            router.push("/(auth)/login");
        }, 1000)
      } else {
        const responseData = await data.json().catch(() => ({}));
        setError(responseData.message || 'A apărut o eroare. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('A apărut o eroare de conexiune. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

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
        
        {/* Buton Înapoi */}
        <Link href="/" asChild>
          <TouchableOpacity style={styles.goBackButton}>
            <Feather name="arrow-left" size={20} color={theme.colors.text.secondary} />
            <Text variant="bodyMedium" style={styles.goBackText}>Înapoi la autentificare</Text>
          </TouchableOpacity>
        </Link>

        {/* Iconiță Centrală */}
        <View style={styles.iconContainer}>
          <View style={styles.iconPlaceholder}>
            <Feather name="lock" size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Setează noua parolă</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Introdu noua parolă pentru contul tău. Asigură-te că folosești minim 8 caractere.
        </Text>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* Input Noua Parolă */}
          <Text variant="titleSmall" style={styles.inputLabel}>Noua parolă</Text>
          <TextInput
            {...passwordInputProps}
            placeholder="Minim 8 caractere"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={handlePasswordChange}
            left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
            right={
              <TextInput.Icon 
                icon={() => <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.colors.text.placeholder} />} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          {/* Input Confirmare Parolă */}
          <Text variant="titleSmall" style={styles.inputLabel}>Confirmă noua parolă</Text>
          <TextInput
            {...confirmPasswordInputProps}
            placeholder="Reintrodu parola"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            left={<TextInput.Icon icon={() => <Feather name="check-circle" size={20} color={theme.colors.text.placeholder} />} />}
            right={
              <TextInput.Icon 
                icon={() => <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={theme.colors.text.placeholder} />} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!confirmPasswordError}>
            {confirmPasswordError}
          </HelperText>


            {successMessage ? (
                    <View style={styles.successContainer}>
                    <Feather name="check-circle" size={24} color="#10B981" />
                    <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                ) :
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.primaryText}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.submitButtonText}
          >
            Salvează parola
          </Button> }

          {error ? (
            <ErrorMessage message={error} />
          ) : null}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  buttonContent: {
    height: 48,
  },
  submitButton: {
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
    successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successText: {
    color: '#059669', // Un verde puțin mai închis pentru text
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  }
});