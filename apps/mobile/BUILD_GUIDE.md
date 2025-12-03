# Guide de Build EAS pour owo!

## ✅ Configuration terminée !

Votre projet est maintenant configuré pour utiliser EAS Build. Voici les prochaines étapes :

## 📱 Étape 1 : Se connecter à EAS

```bash
cd /Users/floriace/owo\!/owo/apps/mobile
eas login
```

Utilisez votre compte Expo (email/password). Si vous n'en avez pas, créez-en un sur https://expo.dev

## 🔨 Étape 2 : Créer votre premier build

### Option A : Build pour TestFlight (Recommandé)

```bash
eas build --platform ios --profile preview
```

**Durée** : 10-20 minutes  
**Résultat** : Un fichier `.ipa` prêt pour TestFlight

### Option B : Build de développement

```bash
eas build --platform ios --profile development
```

**Durée** : 10-15 minutes  
**Résultat** : Un build avec hot reload activé

## 📲 Étape 3 : Installer sur votre iPhone

### Via TestFlight (Option A)

1. Une fois le build terminé, téléchargez le fichier `.ipa` depuis le lien fourni
2. Allez sur [App Store Connect](https://appstoreconnect.apple.com)
3. Créez une nouvelle app si nécessaire :
   - Bundle ID : `com.floriace.owo`
   - Nom : owo!
4. Uploadez le build via **Transporter** (app Mac) ou directement via le navigateur
5. Dans **TestFlight**, ajoutez-vous comme testeur interne
6. Sur votre iPhone, installez l'app **TestFlight** depuis l'App Store
7. Acceptez l'invitation et installez owo!

### Via Installation Directe (Option B)

Si vous avez choisi le build de développement :

```bash
# Après le build, récupérez l'URL du build
# Scannez le QR code avec l'appareil photo de votre iPhone
# Ou ouvrez le lien directement
```

## 🔄 Étape 4 : Mettre à jour l'app

Pour publier une nouvelle version :

```bash
# 1. Mettez à jour la version dans app.json
# 2. Commitez vos changements
git add .
git commit -m "Update to version X.X.X"

# 3. Créez un nouveau build
eas build --platform ios --profile preview
```

## 📋 Profils de build disponibles

### `development`
- Hot reload activé
- Debugging complet
- Pour le développement quotidien
- Nécessite Expo Dev Client

### `preview`
- Build de production
- Distribution via TestFlight
- Idéal pour les tests avant release
- Pas de hot reload

### `production`
- Build final pour l'App Store
- Optimisé et minifié
- Distribution publique

## 🚀 Commandes utiles

```bash
# Voir l'état de vos builds
eas build:list

# Voir les détails d'un build
eas build:view <build-id>

# Soumettre à l'App Store (après TestFlight)
eas submit --platform ios

# Créer un build Android
eas build --platform android --profile preview

# Build pour les deux plateformes
eas build --platform all --profile preview
```

## 💡 Astuces

### Réduire le temps de build
- Les builds sont mis en cache
- Le premier build prend ~20min
- Les suivants prennent ~10min

### Tester avant de builder
```bash
# Simuler le build localement
expo prebuild

# Lancer en mode production
npx expo start --no-dev --minify
```

### Debugging

Si le build échoue :

1. Vérifiez les logs dans le dashboard EAS
2. Vérifiez que toutes les dépendances sont à jour
3. Assurez-vous que `app.json` est valide

## 📱 Après installation

1. Ouvrez owo! sur votre iPhone
2. Créez un compte ou connectez-vous
3. Testez toutes les fonctionnalités :
   - Authentification Firebase
   - Création de wallets
   - Transactions
   - Notifications

## 🐛 Problèmes courants

### "Build failed to compile"
- Vérifiez `package.json` pour les dépendances incompatibles
- Assurez-vous que Firebase est bien configuré

### "No Apple Developer account"
- Vous n'avez pas besoin de compte Apple Developer pour TestFlight interne
- Pour TestFlight externe (100+ testeurs), vous aurez besoin du compte ($99/an)

### "App ne se lance pas"
- Vérifiez que Firebase est configuré
- Vérifiez les logs dans Xcode ou via `eas build:view`

## 🎯 Prochaines étapes recommandées

1. ✅ Créer un build preview
2. ✅ Installer via TestFlight
3. ✅ Tester sur votre iPhone
4. 📝 Noter les bugs éventuels
5. 🔄 Itérer et améliorer
6. 🚀 Publier sur l'App Store

## 🔗 Liens utiles

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Dashboard](https://expo.dev)

## 📞 Support

Si vous rencontrez des problèmes :
- Consultez les logs EAS
- Vérifiez la documentation Expo
- Demandez de l'aide sur le forum Expo

Bon build ! 🚀
