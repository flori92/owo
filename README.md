# owo!

owo! est une application financière mobile construite avec Expo/React Native. Le dépôt contient l'application iOS/Android, une API TypeScript transactionnelle, une application web, les Cloud Functions historiques et les règles Firebase.

## Architecture

- `apps/mobile` : application Expo iOS/Android ;
- `apps/api` : API Fastify, authentification Firebase et registre PostgreSQL en double entrée ;
- `apps/web` : interface web ;
- `functions` : tâches Firebase asynchrones historiques en cours de migration ;
- `docs/PRODUCT_ARCHITECTURE_FR.md` : description fonctionnelle, architecture cible et feuille de route.
- `docs/INSTANT_PAYMENTS_FR.md` : fast path interne, réservations externes, budgets de latence et règlement idempotent.

Le mobile ne fait plus d'écriture financière directe : en production, il transmet une demande idempotente à l'API. Firestore reste utilisable pour les profils, projections et notifications, mais PostgreSQL devient l'autorité des soldes.

## Démarrage mobile

```bash
cd apps/mobile
cp .env.example .env.local
npm ci
npm run validate:config
npm start
```

Les variables Firebase réelles doivent être ajoutées à `.env.local`. Le mode démo n'est jamais activé automatiquement dans un binaire de production.

## Vérifications

```bash
cd apps/mobile
npm run typecheck
npm test
npm run validate:config
```

```bash
cd apps/api
npm ci
npm run check
```

La commande `npm run release:check` bloque une release si Firebase, les pages légales, le support, les identifiants natifs ou les protections anti-démo ne sont pas correctement configurés.

## Publication mobile

Le projet utilise EAS Build et EAS Submit. Voir [apps/mobile/BUILD_GUIDE.md](apps/mobile/BUILD_GUIDE.md) et [docs/STORE_RELEASE_CHECKLIST.md](docs/STORE_RELEASE_CHECKLIST.md).

> Important : le code est préparé pour construire les binaires et l'API fournit maintenant une autorité transactionnelle. La mise en service de transferts réels exige encore des partenaires agréés, une entité juridique, les procédures KYC/AML et les validations réglementaires du pays ciblé.
