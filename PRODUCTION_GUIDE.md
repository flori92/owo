# 🚀 Guide de Mise en Production - owo!

**Date**: Janvier 2025  
**Version**: 1.0.0

---

## 📋 Checklist Pré-Production

### ✅ Sécurité (CRITIQUE)

- [x] Suppression des fichiers sensibles du repository
- [x] Création des templates `.env.example` sécurisés
- [x] Configuration de `apphosting.yaml` avec secrets
- [ ] **Révoquer et regénérer TOUTES les clés API exposées** (voir SECURITY_ALERT.md)
- [ ] Configurer les secrets Firebase App Hosting
- [ ] Activer la 2FA sur tous les comptes admin
- [ ] Configurer les restrictions d'API dans Google Cloud Console

### ✅ Configuration Firebase

- [ ] Vérifier les règles Firestore (`firestore.rules`)
- [ ] Vérifier les règles Storage (`storage.rules`)
- [ ] Déployer les Cloud Functions
- [ ] Configurer les index Firestore
- [ ] Activer l'authentification (Email, Google, Apple)

### ✅ Application Mobile (Expo/EAS)

- [ ] Configurer EAS Build pour production
- [ ] Créer les certificats iOS (App Store Connect)
- [ ] Créer la keystore Android (Google Play Console)
- [ ] Tester le build de production localement

### ✅ Application Web

- [ ] Build de production réussi
- [ ] Tests de performance (Lighthouse)
- [ ] Configuration du domaine personnalisé

---

## 🔐 Étape 1: Sécurisation des Clés API

### 1.1 Révoquer les Clés Exposées

```bash
# Aller sur Firebase Console
https://console.firebase.google.com/project/owo-631ab/settings/general

# 1. Regénérer les clés API Firebase
# 2. Créer un nouveau service account avec permissions minimales
# 3. Révoquer les anciennes clés dans Google Cloud Console
```

### 1.2 Configurer les Secrets Firebase

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter
firebase login

# Configurer les secrets pour App Hosting
firebase apphosting:secrets:set FIREBASE_API_KEY
firebase apphosting:secrets:set FIREBASE_PROJECT_ID
firebase apphosting:secrets:set FIREBASE_AUTH_DOMAIN
firebase apphosting:secrets:set FIREBASE_STORAGE_BUCKET
firebase apphosting:secrets:set FIREBASE_MESSAGING_SENDER_ID
firebase apphosting:secrets:set FIREBASE_APP_ID
firebase apphosting:secrets:set FIREBASE_MEASUREMENT_ID
```

### 1.3 Configurer les Variables d'Environnement Locales

```bash
# Pour l'app mobile
cp apps/mobile/.env.example apps/mobile/.env.local
# Éditer apps/mobile/.env.local avec les NOUVELLES clés

# Pour l'app web
cp apps/web/.env.example apps/web/.env
# Éditer apps/web/.env avec les NOUVELLES clés
```

---

## 📱 Étape 2: Déploiement Mobile (EAS)

### 2.1 Configuration EAS

```bash
cd apps/mobile

# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer le projet
eas build:configure
```

### 2.2 Build de Production

```bash
# Build iOS pour l'App Store
eas build --platform ios --profile production

# Build Android pour le Play Store
eas build --platform android --profile production
```

### 2.3 Soumission aux Stores

```bash
# Soumettre à l'App Store
eas submit --platform ios

# Soumettre au Play Store
eas submit --platform android
```

---

## 🌐 Étape 3: Déploiement Web (Firebase Hosting)

### 3.1 Build de l'Application Web

```bash
cd apps/web

# Installer les dépendances
npm install

# Build de production
npm run build
```

### 3.2 Déploiement Firebase

```bash
cd ../..  # Retour à la racine du projet

# Déployer tout (Hosting + Functions + Rules)
firebase deploy

# Ou déployer séparément
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### 3.3 Configuration du Domaine Personnalisé

```bash
# Dans Firebase Console > Hosting > Ajouter un domaine personnalisé
# Suivre les instructions pour configurer les DNS
```

---

## ⚙️ Étape 4: Cloud Functions

### 4.1 Déployer les Functions

```bash
cd functions

# Installer les dépendances
npm install

# Déployer
firebase deploy --only functions
```

### 4.2 Vérifier les Logs

```bash
firebase functions:log
```

---

## 🧪 Étape 5: Tests Pré-Lancement

### 5.1 Tests Fonctionnels

- [ ] Inscription utilisateur
- [ ] Connexion (Email, Google, Apple)
- [ ] Création de wallet
- [ ] Transactions
- [ ] Objectifs d'épargne
- [ ] Notifications

### 5.2 Tests de Performance

```bash
# Lighthouse CLI
npx lighthouse https://votre-domaine.com --view
```

### 5.3 Tests de Sécurité

- [ ] Vérifier que les règles Firestore bloquent les accès non autorisés
- [ ] Tester les validations côté serveur
- [ ] Vérifier les headers de sécurité

---

## 📊 Étape 6: Monitoring

### 6.1 Firebase Analytics

- Activer dans Firebase Console
- Configurer les événements personnalisés

### 6.2 Crashlytics

```bash
# Déjà intégré avec Expo, vérifier dans Firebase Console
```

### 6.3 Performance Monitoring

- Activer dans Firebase Console > Performance

---

## 🔄 Étape 7: CI/CD (Optionnel)

### 7.1 GitHub Actions pour le Web

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          cd apps/web
          npm ci
          
      - name: Build
        run: |
          cd apps/web
          npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
          
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### 7.2 EAS Build Automatique

```yaml
# Dans eas.json, ajouter:
{
  "build": {
    "production": {
      "autoSubmit": true,
      "channel": "production"
    }
  }
}
```

---

## 📝 Commandes Utiles

```bash
# Vérifier le statut Firebase
firebase projects:list

# Voir les déploiements
firebase hosting:channel:list

# Rollback si problème
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live

# Logs des functions
firebase functions:log --only processAutoDebit

# Emulateur local
firebase emulators:start
```

---

## 🆘 En Cas de Problème

1. **Erreur de build**: Vérifier les logs avec `eas build:view`
2. **Functions qui crashent**: `firebase functions:log`
3. **Problèmes d'auth**: Vérifier la configuration OAuth dans Firebase Console
4. **Règles Firestore**: Tester dans le simulateur de règles Firebase

---

## 📞 Contacts & Ressources

- **Firebase Console**: https://console.firebase.google.com/project/owo-631ab
- **Expo Dashboard**: https://expo.dev
- **Documentation Firebase**: https://firebase.google.com/docs
- **Documentation Expo**: https://docs.expo.dev

---

**✅ Une fois tous les points cochés, l'application est prête pour la production!**
