# 🔐 Configuration Authentification Google & Apple

## 🎯 Objectif
Configurer l'authentification sociale (Google OAuth et Apple Sign In) pour l'application owo! avec Appwrite.

## 📋 Prérequis

### 1. Console Google Cloud
- Accès à: https://console.cloud.google.com/
- Projet Google Cloud créé

### 2. Console Apple Developer
- Accès à: https://developer.apple.com/
- Compte développeur Apple (99$/an)
- App ID créé

## 🔧 Étapes de Configuration

### 🌐 Google OAuth

#### 1. Créer le projet Google Cloud
```bash
1. Aller sur: https://console.cloud.google.com/
2. Créer un nouveau projet: "owo-mobile-app"
3. Sélectionner le projet
```

#### 2. Activer les APIs requises
```bash
1. Bibliothèque → "Google+ API" → Activer
2. Bibliothèque → "Google Identity Toolkit API" → Activer
3. Bibliothèque → "People API" → Activer (pour les profils)
```

#### 3. Créer les identifiants OAuth
```bash
1. Identifiants → "Créer des identifiants" → "ID client OAuth"
2. Type d'application: "Application web"
3. Nom: "owo-mobile-app-web"
4. URI de redirection autorisés:
   - https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google
   - http://localhost:8080/v1/account/sessions/oauth2/callback/google (dev)
5. Copier le Client ID et Client Secret
```

#### 4. Configurer dans Appwrite
```bash
1. Console Appwrite → Auth → Settings → Google OAuth
2. Activer Google OAuth
3. Client ID: [coller depuis Google Console]
4. Client Secret: [coller depuis Google Console]
5. Enregistrer
```

### 🍎 Apple Sign In

#### 1. Créer l'App ID
```bash
1. Developer.apple.com → Certificates, Identifiers & Profiles
2. Identifiers → "Créer un identifiant" → "App IDs"
3. Description: "owo Mobile App"
4. Bundle ID: "com.owo.mobile"
5. Cocher "Sign In with Apple"
6. Enregistrer
```

#### 2. Créer le Service ID
```bash
1. Identifiers → "Créer un identifiant" → "Services IDs"
2. Description: "owo Web Auth"
3. Identifier: "com.owo.web"
4. Cocher "Sign In with Apple"
5. Configurer:
   - Primary App ID: "com.owo.mobile"
   - Return URLs:
     * https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple
     * owo://auth (mobile deep link)
6. Enregistrer
```

#### 3. Générer la clé privée
```bash
1. Keys → "Créer une clé"
2. Nom de la clé: "owo Sign In Key"
3. Cocher "Sign In with Apple"
4. Configurer:
   - Primary App ID: "com.owo.mobile"
5. Enregistrer et télécharger le fichier .p8
6. Noter: Key ID, Team ID
```

#### 4. Configurer dans Appwrite
```bash
1. Console Appwrite → Auth → Settings → Apple OAuth
2. Activer Apple OAuth
3. Key ID: [depuis le fichier .p8]
4. Team ID: [votre Team ID Apple]
5. Private Key: [contenu du fichier .p8]
6. Bundle ID: "com.owo.mobile"
7. Enregistrer
```

## 📱 Configuration React Native

### 1. Dépendances requises
```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin

# Apple Sign-In (iOS uniquement)
npm install @invertase/react-native-apple-authentication

# Web Browser pour OAuth
npm install react-native-webview
```

### 2. Configuration Android
```xml
<!-- android/app/build.gradle -->
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}

<!-- android/app/src/main/AndroidManifest.xml -->
<activity ...>
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="owo" />
    </intent-filter>
</activity>
```

### 3. Configuration iOS
```xml
<!-- ios/owo/Info.plist -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.owo.mobile</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>owo</string>
        </array>
    </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>googlechromes</string>
    <string>googlechrome</string>
    <string>safari</string>
</array>
```

### 4. Configuration Google Services
```bash
1. Télécharger google-services.json depuis Google Console
2. Placer dans: android/app/google-services.json
3. Ajouter dans android/build.gradle:
   classpath 'com.google.gms:google-services:4.3.15'
4. Ajouter dans android/app/build.gradle:
   apply plugin: 'com.google.gms.google-services'
```

## 🔗 Configuration Deep Links

### 1. Expo Router Configuration
```javascript
// app.json
{
  "expo": {
    "scheme": "owo",
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": false
        }
      ]
    ]
  }
}
```

### 2. URL Callback Handler
```javascript
// Créer un fichier pour gérer les callbacks OAuth
// src/utils/oauthCallback.js
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

export const handleOAuthCallback = async (url) => {
  try {
    await WebBrowser.openBrowserAsync(url);
    
    // Écouter le callback
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith('owo://auth')) {
        WebBrowser.dismissBrowser();
        // Traiter le callback OAuth
        return url;
      }
    });
    
    return subscription;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return null;
  }
};
```

## 🧪 Tests

### 1. Test Google OAuth
```bash
1. Lancer l'app
2. Cliquer sur "Google"
3. Vérifier la redirection vers Google
4. S'authentifier avec un compte Google
5. Vérifier le retour dans l'app
6. Vérifier la création du profil dans Appwrite
```

### 2. Test Apple Sign In
```bash
1. Lancer l'app sur iOS
2. Cliquer sur "Apple"
3. Vérifier la popup Apple Sign In
4. S'authentifier avec Face ID/Touch ID
5. Vérifier le retour dans l'app
6. Vérifier la création du profil dans Appwrite
```

## 📊 Monitoring

### 1. Console Appwrite
- Auth → Sessions → Voir les connexions OAuth
- Database → Profiles → Vérifier les créations de profils

### 2. Console Google Cloud
- APIs & Services → Credentials → Utilisation des tokens
- APIs & Services → Dashboard → Appels API

### 3. Console Apple Developer
- Certificates, Identifiers & Profiles → Utilisation des Service IDs

## 🔒 Sécurité

### 1. Best Practices
```bash
- Valider les domaines de redirection
- Utiliser des secrets forts
- Limiter les scopes aux permissions nécessaires
- Activer la vérification en deux étapes sur les comptes développeurs
- Surveiller les logs d'authentification
```

### 2. Configuration Appwrite
```bash
- Activer "Session Duration" approprié
- Configurer "Password Policy" pour les comptes email
- Activer "Brute Force Protection"
- Configurer "OAuth Scopes" minimum requis
```

## 🚀 Déploiement

### 1. Production
```bash
- Mettre à jour les URLs de callback pour la production
- Tester avec les bundles de production
- Vérifier les certificats Apple en production
- Configurer les domaines autorisés dans Google Console
```

### 2. Monitoring Post-déploiement
```bash
- Surveiller les taux de conversion OAuth
- Vérifier les erreurs d'authentification
- Monitorer les performances des callbacks
- Analyser les abandons de connexion
```

## 📚 Documentation Officielle

- [Appwrite Google OAuth](https://appwrite.io/docs/authentication/google-oauth2)
- [Appwrite Apple OAuth](https://appwrite.io/docs/authentication/apple-oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [React Native Apple Authentication](https://github.com/invertase/react-native-apple-authentication)

## ⚠️ Notes Importantes

1. **Apple Sign In** est obligatoire pour les apps publiées sur l'App Store iOS
2. **Google OAuth** nécessite une vérification du domaine pour la production
3. Les **deep links** doivent être configurés correctement pour les callbacks
4. Les **certificats** Apple expirent et doivent être renouvelés
5. **Tester** sur de vrais devices, pas seulement sur simulateur

---

Une fois configuré, les utilisateurs pourront se connecter en un clic avec Google ou Apple ! 🎯
