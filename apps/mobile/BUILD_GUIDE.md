# Construire et soumettre owo! avec EAS

## 1. Préparer l'environnement

```bash
cd apps/mobile
npm ci
cp .env.example .env.production
# Remplir .env.production avec les valeurs réelles
npm run release:check
```

Déclarez ensuite chaque variable `EXPO_PUBLIC_*` dans l'environnement `production` du projet EAS :

```bash
npx eas-cli@latest login
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_FIREBASE_API_KEY --value "..." --visibility sensitive
```

Répétez la commande pour les variables listées dans `.env.example`. Les clés privées, comptes de service et mots de passe ne doivent jamais utiliser le préfixe `EXPO_PUBLIC_`.

Avant le build, déployez `apps/api` sur une URL HTTPS reliée à PostgreSQL, puis définissez `EXPO_PUBLIC_API_URL` avec cette URL dans les environnements EAS `preview` et `production`.

## 2. Valider sur appareils

```bash
npx eas-cli@latest build --platform all --profile preview
```

Le profil Android `preview` produit un APK installable. Le profil iOS `preview` produit un build interne destiné aux appareils enregistrés. Testez au minimum l'inscription, la reconnexion après redémarrage, le scan QR, les transactions, le support et la suppression de compte.

## 3. Construire les binaires store

```bash
npm run build:production
```

EAS crée un AAB Android et une archive iOS. Les numéros de build sont gérés à distance et incrémentés automatiquement.

## 4. Soumettre en piste de test

```bash
npm run submit:production
```

- Android est envoyé en piste `internal` avec une release brouillon.
- iOS est envoyé à App Store Connect, puis doit être affecté à TestFlight.
- Le premier upload Google Play doit généralement être initialisé dans Play Console avant l'automatisation par compte de service.

## 5. Publier

Complétez les fiches store, la déclaration de confidentialité, les captures, les coordonnées de support, l'URL de suppression de compte et les notes de revue. Fournissez à Apple et Google un compte de démonstration fonctionnel si l'application exige une connexion.

La checklist complète est dans `../../docs/STORE_RELEASE_CHECKLIST.md`.
