import { Redirect } from 'expo-router';

/**
 * Route par défaut des tabs - redirige vers home
 * Évite l'erreur "Uh oh! this screen doesn't exist yet"
 */
export default function TabsIndex() {
  return <Redirect href="/(tabs)/home" />;
}
