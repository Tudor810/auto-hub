import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Link } from 'expo-router';

interface LoginScreenProps {
  onSignIn?: (email: string, pass: string) => void;
  onGoogleSignIn?: () => void;
  onSignUpNavigation?: () => void;
  onForgotPassword?: () => void;
}

const imagePlaceholder = require("../assets/images/logo.png");

export default function LoginScreen({
  onSignIn,
  onGoogleSignIn,
  onSignUpNavigation,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Image 
                source={imagePlaceholder} 
                style={{ width: 130, height: 130 }} // Adjust to your needs
              />
              {/* <AntDesign name="car" size={32} color="#0EA5E9" />
              <Text style={styles.logoText}>AutoHub</Text> */}
            </View>
          </View>

          {/* Headers */}
          <Text style={styles.title}>Welcome to AutoHub</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Google Sign In Button */}
          <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignIn}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png' }} 
              style={{ width: 20, height: 20 }} 
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        

          {/* Footer Links */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onForgotPassword}>
              <Text style={styles.footerLink}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignUpNavigation}>
              <Text style={styles.footerText}>
                Need an account? <Link href = {"/sign-up"}style={styles.footerLinkBold}>Sign up</Link>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background to match the image
    width:'100%'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 500, // Constrains width on Web/Tablets for a clean card look
    borderRadius: 16,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  logoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 15
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
    outlineStyle: 'none', // Prevents default web focus ring
  } as any, // Cast to any to suppress TS error for web-only outlineStyle
  signInButton: {
    backgroundColor: '#0F172A', // Dark navy/black from the image
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 13,
  },
  footerLink: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  footerLinkBold: {
    color: '#111827',
    fontWeight: '700',
  },
});