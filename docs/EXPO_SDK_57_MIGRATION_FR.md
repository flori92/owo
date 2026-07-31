# Migration Expo SDK 57

Date : 31 juillet 2026

## Cible

- Expo SDK 57 ;
- React 19.2.3 ;
- React Native 0.86.2 ;
- Expo Router 57 ;
- React Native Reanimated 4.5.1 ;
- React Native Worklets 0.10.1 ;
- TypeScript 6.0.

La migration a été réalisée progressivement depuis SDK 54 vers 55, 56 puis 57 afin d'isoler les incompatibilités.

## Adaptations

- suppression de `newArchEnabled`, la nouvelle architecture étant obligatoire à partir de SDK 55 ;
- remplacement de l'ancienne clé `splash` par le plugin `expo-splash-screen` ;
- alignement automatique de tous les modules Expo avec `expo install --fix` ;
- suppression des polyfills historiques `expo-status-bar` ;
- suppression de `react-native-calendars`, inutilisé dans le code ;
- suppression de `react-native-maps` et `@teovilla/react-native-web-maps`, inutilisés ;
- suppression de Skia et `react-native-graph`, inutilisés et responsables d'un échec WebAssembly sur le web ;
- mise à jour du lockfile et correction de `brace-expansion`.

## Résultats de validation

- `expo-doctor` : 20/20 contrôles réussis ;
- `expo install --check` : dépendances à jour ;
- `npm audit` : 0 vulnérabilité ;
- TypeScript mobile : réussi ;
- tests financiers mobiles : réussis ;
- API : typecheck, tests et build réussis ;
- export web de production : réussi sans avertissement ;
- configuration des plugins iOS/Android : évaluée avec succès ;
- accueil et Coach owo! : contrôlés dans le navigateur sans erreur runtime.

## Livraison native

Le projet utilise Continuous Native Generation : les dossiers `ios` et `android` ne sont pas versionnés et seront générés par EAS avec SDK 57. Toute build de développement existante doit être reconstruite après cette migration native.

SDK 57 cible notamment React Native 0.86 et requiert une chaîne Apple récente pour compiler iOS. La compilation iOS finale doit être exécutée sur EAS/macOS ; Windows ne fournit pas le simulateur ni Xcode.
