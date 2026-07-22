# Application mobile owo!

## Prérequis

- Node.js 20.19 ou supérieur
- npm
- un projet Firebase
- un compte Expo pour les builds cloud
- macOS/Xcode uniquement si vous souhaitez compiler iOS localement

## Installation

```bash
cp .env.example .env.local
npm ci
npm run validate:config
npm start
```

Commandes utiles :

```bash
npm run android
npm run ios
npm run typecheck
npm test
npm run release:check
```

Pour une release, créez `.env.production` avec les valeurs de `.env.example`, puis recopiez les mêmes variables dans l'environnement `production` d'EAS. Les fichiers `.env*` remplis restent exclus de Git.

`EXPO_PUBLIC_API_URL` est obligatoire en production. Le mobile envoie son jeton Firebase à cette API et ne doit jamais contenir une URL PostgreSQL, un secret prestataire ou une clé de service.

La configuration de production interdit le bypass d'authentification et la migration des données de démonstration.
