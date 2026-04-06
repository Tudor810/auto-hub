import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme, Button } from 'react-native-paper';
import { Image } from 'expo-image';
import { IAuthSuccessResponse } from '@auto-hub/shared/types/userTypes';
import { router, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function GoogleSignInButton({ setError }: { setError: (message: string) => void }) {

  const { login } = useAuth();
  const theme = useTheme();
  const styles = makeStyles(theme);

  // GoogleSignin.configure({
  //   webClientId: '64399865931-uv8ni2g23vbn427o2v6io528qkg67ovt.apps.googleusercontent.com',
  //   iosClientId: '64399865931-v2t2v6qc02556ne273t93ne759b2b7pu.apps.googleusercontent.com',
  //   offlineAccess: true, 
  // });

  const handleMobileSignIn = async () => {
    //   try {
    //     await GoogleSignin.hasPlayServices();
    //     const response = await GoogleSignin.signIn();
    //     const idToken = response.data?.idToken;

    //     if (idToken) {
    //       sendTokenToBackend(idToken, 'idToken');
    //     }
    //   } catch (error) {
    //     console.error("Mobile Google Sign-In Error:", error);
    //     setError('Google Sign-In failed. Please try again.');
    //   }
  };

  let handleWebSignIn = () => { };

  if (Platform.OS === 'web') {
    handleWebSignIn = useGoogleLogin({
      onSuccess: async (tokenResponse) => {

        if (tokenResponse.access_token) {
          sendTokenToBackend(tokenResponse.access_token, 'accessToken');
        }
      },
      onError: () => {
        setError('Google Sign-In failed. Please try again.');
        console.log('Web Google Login Failed');
      },
    });
  }

  const sendTokenToBackend = async (token: string, type: 'idToken' | 'accessToken') => {
    try {

      const bodyData = type === 'idToken' ? { idToken: token } : { accessToken: token };

      const api = (Platform.OS === 'web') ? process.env.EXPO_PUBLIC_API_WEB : process.env.EXPO_PUBLIC_API_MOBILE;

      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        // Send exactly what your Express route expects
        body: JSON.stringify(bodyData)
      });

      const resultData: IAuthSuccessResponse = await response.json();

      if (response.ok) {
        if (resultData.user.role === null) {
          await login(resultData.user, resultData.token);
        } else {
          await login(resultData.user, resultData.token);
        }
        router.replace('/');
      } else {
        setError(resultData.message || 'Google Sign-In failed. Please try again.');
      }

    } catch (error) {
      setError('Network error during sign-in. Please try again.');
      console.error('Backend API error:', error);
    }
  };


  return (
    <Button
      mode="outlined"
      onPress={() => Platform.OS === 'web' ? handleWebSignIn() : handleMobileSignIn()}
      style={styles.googleButton}
      contentStyle={styles.buttonContent}
      labelStyle={styles.googleButtonText}
      icon={() => (
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png' }}
          style={{ width: 20, height: 20 }}
        />
      )}
    >
      Continuă cu Google
    </Button>
  );
}



const makeStyles = (theme: any) => StyleSheet.create({
  googleButton: {
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.button,
    marginBottom: theme.spacing.lg,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  buttonContent: {
    height: 48,
  },
});
