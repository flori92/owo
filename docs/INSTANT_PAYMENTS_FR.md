# Paiements instantanés owo!

## Ce que « instantané » signifie

L'API ne doit pas attendre un webhook pour répondre. Elle vise les budgets suivants, mesurés au percentile 95 dans la région principale :

- accusé de réception d'une commande externe : moins de 300 ms côté serveur ;
- transfert owo! vers owo! : écriture définitive en moins de 500 ms ;
- changement visible dans l'application : moins d'une seconde après confirmation du rail ;
- aucune double opération lors d'un retry réseau.

Ces objectifs excluent la latence radio du téléphone et celle d'un opérateur externe. Un partenaire qui ne fournit qu'une confirmation asynchrone ne peut pas être présenté honnêtement comme définitivement réglé avant sa confirmation.

## Deux chemins d'exécution

### 1. Fast path interne

Lorsque le numéro E.164 vérifié correspond à un autre utilisateur owo! :

1. l'API vérifie identité, devise et compte ;
2. elle verrouille les comptes dans un ordre déterministe ;
3. elle contrôle le solde disponible ;
4. elle crée le débit et le crédit ;
5. PostgreSQL refuse le commit si l'écriture n'est pas équilibrée ;
6. l'API répond `completed` dans la même requête.

Le retry avec la même clé d'idempotence retourne la même opération sans second débit.

### 2. Rail externe

Lorsque le bénéficiaire ou le dépôt dépend d'un opérateur :

1. l'API réserve immédiatement les fonds avec un `account_hold` ;
2. elle répond `processing` et émet un événement d'outbox ;
3. le worker appelle le prestataire avec la même clé d'idempotence ;
4. si la réponse synchrone est définitive, elle est comptabilisée immédiatement ;
5. sinon le webhook signé appelle la même fonction idempotente de règlement ;
6. le webhook tardif sert aussi au rapprochement et ne peut pas doubler l'écriture.

Une réservation expirée n'est pas rendue disponible par une simple lecture de l'heure. Un processus contrôlé doit la libérer après vérification du statut prestataire, afin d'éviter qu'une confirmation tardive crée un solde négatif.

## Expérience mobile

- `completed` : confirmation « Transfert effectué » ;
- `processing` : confirmation immédiate « Traitement lancé », sans prétendre que le règlement est final ;
- `failed` : motif utilisateur clair, par exemple solde insuffisant ;
- historique et solde disponible rafraîchis immédiatement dans l'application ;
- polling rapide durant les 15 premières secondes, puis 5 s et 30 s ;
- FCM doit devenir le canal principal de réveil dès que le worker prestataire est déployé.

## Déploiement faible latence

- placer Cloud Run et Cloud SQL dans la même région proche des utilisateurs ;
- conserver au moins une instance chaude pour le pilote, trois pour une haute disponibilité plus stricte ;
- activer le startup CPU boost, limiter le pool SQL et mesurer les temps `auth`, `db-lock`, `provider` et `ledger` ;
- dimensionner la concurrence après test de charge, pas au hasard ;
- définir des timeouts courts, un circuit breaker et un retry borné pour chaque prestataire ;
- alerter sur le P95/P99, le taux `processing > 30 s`, les réservations expirées et les écarts de rapprochement.

## Contrat prestataire restant

Le dépôt fournit `PaymentProviderAdapter` et `applyProviderResult`. L'adaptateur concret doit encore être écrit pour le partenaire retenu, car la signature, les endpoints, les statuts et les règles de retry sont propres à MTN, Orange, Wave, une banque ou un émetteur de carte. Aucun webhook générique non vérifiable ne doit être accepté.
