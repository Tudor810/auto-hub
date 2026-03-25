// screens/SignUpScreen.tsx
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import React, { use, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Menu, Surface, Text, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from 'react-native-paper';
import { useInputProps } from '@/hooks/useInputProps';


interface SignUpScreenProps {
  onGoBack?: () => void;
  onSignUpSuccess?: (userData: any) => void;
}



export default function SignUpScreen({ onGoBack, onSignUpSuccess }: SignUpScreenProps) {
  const router = useRouter();
  
  // -- Form State --
  const [role, setRole] = useState<'customer' | 'provider' | null>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

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

  const handleSignUp = () => {
    if (onSignUpSuccess) {
      const userData = {
        role,
        fullName,
        phoneNumber,
        email,
        password,
        // Optional business fields
        ...(role === 'provider' ? { businessName, businessAddress } : {})
      };
      onSignUpSuccess(userData);
    }
  };

  // Reusable text field prop object to apply global styles easily
  const inputProps = useInputProps();
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
              <TouchableOpacity onPress={openMenu} activeOpacity={1}>
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
            <Menu.Item titleStyle = {{color: theme.colors.text.main}} onPress={() => { setRole('customer'); closeMenu(); }} title="Customer (Finding Services)" />
            <Menu.Item titleStyle = {{color: theme.colors.text.main}} onPress={() => { setRole('provider'); closeMenu(); }} title="Service Provider (Offering Services)" />
          </Menu>

          {/* Conditional Common Fields (Shown once a role is selected) */}
          {role && (
            <>
              <Text variant="titleSmall" style={styles.inputLabel}>Full Name</Text>
              <TextInput
                {...inputProps}
                placeholder="Your Full Name"
                value={fullName}
                onChangeText={setFullName}
                left={<TextInput.Icon icon={() => <Feather name="user" size={20} color={theme.colors.text.placeholder} />} />}
              />

              <Text variant="titleSmall" style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                {...inputProps}
                placeholder="+40 7xx xxx xxx"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon={() => <Feather name="phone" size={20} color={theme.colors.text.placeholder} />} />}
              />

              <Text variant="titleSmall" style={styles.inputLabel}>Email</Text>
              <TextInput
                {...inputProps}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                left={<TextInput.Icon icon={() => <Feather name="mail" size={20} color={theme.colors.text.placeholder} />} />}
              />
            </>
          )}

          {role && (
            <>
              <Text variant="titleSmall" style={styles.inputLabel}>Password</Text>
              <TextInput
                {...inputProps}
                placeholder="Min. 8 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
              />

              <Text variant="titleSmall" style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                {...inputProps}
                placeholder="Re-enter password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                left={<TextInput.Icon icon={() => <Feather name="lock" size={20} color={theme.colors.text.placeholder} />} />}
              />

              {/* Terms Checkbox (Usually relevant for sign-up) */}
              <View style={styles.termsContainer}>
                 <Feather onPress={() => {setTerms(prevState => !prevState)}} name={terms ? "check-square" : "square"} size={16} color={terms ? theme.colors.primary : theme.colors.text.placeholder} />
                 <Text variant="bodySmall" style={styles.termsText}>
                    I agree to the <Link href = {"/terms"} style={styles.termsLink}>Terms of Service</Link> and <Link href = {"/privacy"} style={styles.termsLink}>Privacy Policy</Link>.
                 </Text>
              </View>

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