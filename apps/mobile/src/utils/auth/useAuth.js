import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';
import { useAppwriteAuth } from '@/hooks/useAppwrite';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey)
      .then((auth) => {
        try {
          useAuthStore.setState({
            auth: auth ? JSON.parse(auth) : null,
            isReady: true,
          });
        } catch (error) {
          console.log('Auth parse error, using null:', error);
          useAuthStore.setState({
            auth: null,
            isReady: true,
          });
        }
      })
      .catch((error) => {
        console.log('Auth storage error, using null:', error);
        useAuthStore.setState({
          auth: null,
          isReady: true,
        });
      });
  }, []);

  useEffect(() => {
    initiate();
  }, [initiate]);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
  }, [close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { user, loading } = useAppwriteAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!loading && !user) {
      // Rediriger vers la page de login au lieu d'ouvrir un modal
      router.replace('/auth/login');
    }
  }, [user, loading, open, options?.mode]);
};

export default useAuth;