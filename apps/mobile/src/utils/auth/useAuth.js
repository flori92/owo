import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';


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
    SecureStore.getItemAsync(authKey).then((auth) => {
      useAuthStore.setState({
        auth: auth ? JSON.parse(auth) : null,
        isReady: true,
      });
    });
  }, []);

  useEffect(() => {}, []);

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
  // Étape 1 : désactivation temporaire de l'auth obligatoire.
  // On ne force plus l'ouverture du modal d'authentification afin de pouvoir
  // naviguer dans l'application sans backend d'auth opérationnel.
  // La logique originale est laissée en commentaire pour réactivation ultérieure.

  // const { isAuthenticated, isReady } = useAuth();
  // const { open } = useAuthModal();
  //
  // useEffect(() => {
  //   if (!isAuthenticated && isReady) {
  //     open({ mode: options?.mode });
  //   }
  // }, [isAuthenticated, open, options?.mode, isReady]);

  // Hook neutre pour l'instant
  useEffect(() => {
    // no-op
  }, []);
};

export default useAuth;