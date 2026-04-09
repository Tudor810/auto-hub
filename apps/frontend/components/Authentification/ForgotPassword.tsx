import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
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
import ErrorMessage from '../ErrorMessage';
import { API_BASE_URL } from '@/utils/api';

export default function ForgotPasswordScreen() {
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitPressed, setSubmitPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Te rugăm să introduci adresa de email.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Te rugăm să introduci o adresă de email validă.';
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (submitPressed) setEmailError(validateEmail(text));
    // Ascundem mesajele de eroare/succes dacă utilizatorul începe să tasteze din nou
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async () => {
    setSubmitPressed(true);
    setError('');
    setSuccessMessage('');

    const emailErr = validateEmail(email);
    setEmailError(emailErr);

    if (emailErr) {
      return;
    }

    setIsLoading(true);

    try {
      // Trimitem cererea către backend
      const data = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (data.ok) {
        setSuccessMessage('Dacă adresa de email există în sistem, vei primi un link pentru resetarea parolei în câteva momente. Dacă nu găsești emailul, verifică folderul Spam.');
        setEmail(''); // Curățăm câmpul după succes
        setSubmitPressed(false); // Resetăm starea butonului
      } else {
        const responseData = await data.json().catch(() => ({}));
        setError(responseData.message || 'A apărut o eroare. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('A apărut o eroare de conexiune. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const emailInputProps = useInputProps(undefined, !!emailError);
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
            <Feather name="key" size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Ai uitat parola?</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Introdu adresa de email asociată contului tău și îți vom trimite instrucțiunile pentru resetarea parolei.
        </Text>

        {/* Mesaj de Succes (Dacă email-ul a fost trimis cu succes) */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <Feather name="check-circle" size={24} color="#10B981" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : (
          /* Form Container */
          <View style={styles.formContainer}>
            <Text variant="titleSmall" style={styles.inputLabel}>Email</Text>
            <TextInput
              {...emailInputProps}
              placeholder="tu@exemplu.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              left={<TextInput.Icon icon={() => <Feather name="mail" size={20} color={theme.colors.text.placeholder} />} />}
            />
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>

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
              Trimite instrucțiuni
            </Button>

            {error && (
              <ErrorMessage message={error} />
            )}
          </View>
        )}

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
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Sau folosește tema ta pentru culoarea primară cu opacitate
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