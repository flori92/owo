import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useAuth as useFirebaseAuth } from '@/hooks/useFirebase';

/**
 * Façade d'authentification unique pour l'application.
 * Firebase est la seule source de vérité afin d'éviter les sessions divergentes.
 */
export const useAuth = () => {
  const firebaseAuth = useFirebaseAuth();

  const signIn = useCallback(() => router.push('/auth/login'), []);
  const signUp = useCallback(() => router.push('/auth/register'), []);
  const signOut = useCallback(async () => {
    const result = await firebaseAuth.logout();
    router.replace('/auth/login');
    return result;
  }, [firebaseAuth.logout]);

  return {
    ...firebaseAuth,
    isReady: !firebaseAuth.loading,
    isAuthenticated: firebaseAuth.loading ? null : Boolean(firebaseAuth.user),
    auth: firebaseAuth.user ? { user: firebaseAuth.user } : null,
    signIn,
    signUp,
    signOut,
    initiate: firebaseAuth.checkAuth,
  };
};

export const useRequireAuth = () => {
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    const authBypass = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (!authBypass && !loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);
};

export default useAuth;
