# API owo!

API transactionnelle TypeScript destinée à Cloud Run. Elle vérifie les jetons Firebase côté serveur, reçoit des demandes idempotentes et conserve les soldes dans un registre PostgreSQL en double entrée.

## Démarrage local

Prérequis : Node.js 20.19+, PostgreSQL 16+ et des identifiants Google Application Default Credentials.

```bash
cp .env.example .env
npm ci
npm run migrate
npm run dev
```

Les endpoints publics sont `GET /health/live` et `GET /health/ready`. Les routes `/v1/*` requièrent `Authorization: Bearer <Firebase ID token>`.

## Contrat initial

- `GET /v1/me` : synchronise le compte Firebase et crée le wallet XOF principal.
- `GET /v1/accounts` : retourne les comptes et leurs soldes calculés depuis le registre.
- `GET /v1/payment-intents` : retourne les demandes récentes.
- `GET /v1/payment-intents/:id` : retourne le statut courant sans cache.
- `POST /v1/payment-intents` : crée une demande idempotente, sans prétendre qu'un transfert externe est déjà réglé.
- `POST /v1/account-deletion-requests` : ouvre une demande de suppression traçable.

Un transfert entre deux numéros Firebase vérifiés et inscrits chez owo! utilise le fast path : verrouillage des comptes, contrôle du disponible, débit/crédit et réponse `completed` dans la même transaction. Un rail externe crée une réservation et répond immédiatement `processing`.

Une intégration MTN/Orange/Wave ou bancaire doit consommer l'outbox, appeler le prestataire et transmettre sa réponse à `applyProviderResult`. Son webhook signé appelle la même fonction idempotente. Le client mobile n'est jamais autorisé à définir lui-même un solde ou un statut final. Voir `docs/INSTANT_PAYMENTS_FR.md`.

## Déploiement Cloud Run

Construire le conteneur depuis `apps/api`, fournir `DATABASE_URL`, `DATABASE_SSL=true`, `FIREBASE_PROJECT_ID` et les origines CORS, puis associer un compte de service avec le rôle Firebase Authentication nécessaire. Le service écoute `0.0.0.0:$PORT` et ferme proprement son pool PostgreSQL sur `SIGTERM`.

Pour la production, stocker `DATABASE_URL` dans Secret Manager et relier Cloud Run à Cloud SQL PostgreSQL avec un pool limité. Les migrations s'exécutent comme une étape contrôlée avant le basculement de trafic, pas au démarrage de chaque instance. Conserver une instance chaude réduit les cold starts ; le nombre exact doit être validé par test de charge et budget.
