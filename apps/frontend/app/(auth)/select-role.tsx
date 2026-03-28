import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Menu, Surface, Text, TextInput } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from 'react-native-paper';
import { useAuth } from '@/context/AuthContext';
import { useInputProps } from '@/hooks/useInputProps';
import ErrorMessage from '@/components/ErrorMessage';
import { IUserUpdateResponse } from '@auto-hub/shared/types/userTypes';
import { API_BASE_URL } from '@/utils/api';


export default function SelectRole() {
  const router = useRouter();
  const { user, updateUser, token } = useAuth();

  // -- Form State --
  const [role, setRole] = useState<'customer' | 'provider' | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // -- Role Selector Menu State --
  const [visible, setVisible] = useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const getRoleLabel = () => {
    switch (role) {
      case 'customer': return 'Customer (Finding Services)';
      case 'provider': return 'Service Provider (Offering Services)';
      default: return 'Select your role...';
    }
  };

  const handleSelectRole = async () => {
    if (!role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ role })
      });

      const data: IUserUpdateResponse = await response.json();

      if (response.ok) {
        updateUser({ role: data.user.role });

        router.replace('/dashboard');
      } else {
        setError(data.message || 'Failed to update role. Please try again.');
      }
    } catch (err) {
      console.error('Update role error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Headers */}
        <Text variant="headlineSmall" style={styles.title}>Choose your role</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Welcome {user?.fullName}! Please select how you'll use AutoHub.
        </Text>

        {/* Form Container */}
        <View style={styles.formContainer}>

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
            <Menu.Item
              titleStyle={{ color: theme.colors.text.main }}
              onPress={() => { setRole('customer'); closeMenu(); setError(''); }}
              title="Customer (Finding Services)"
            />
            <Menu.Item
              titleStyle={{ color: theme.colors.text.main }}
              onPress={() => { setRole('provider'); closeMenu(); setError(''); }}
              title="Service Provider (Offering Services)"
            />
          </Menu>

          <Button
            mode="contained"
            onPress={handleSelectRole}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.primaryText}
            style={styles.selectButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.selectButtonText}
            loading={loading}
            disabled={loading}
          >
            Continue
          </Button>

          {error && (
            <ErrorMessage message={error} />
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
  title: {
    fontWeight: '700',
    color: theme.colors.text.main,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.text.secondary,
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
  buttonContent: {
    height: 48,
  },
  selectButton: {
    borderRadius: theme.borderRadius.button,
    marginTop: theme.spacing.lg,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});