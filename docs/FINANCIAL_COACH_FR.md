# Coach financier et investissement éducatif owo!

## Fonctions livrées

Le premier socle du Coach owo! comprend :

- un profil financier en XAF avec revenus, épargne disponible et mensualités de dettes ;
- un budget camerounais par catégories ;
- le calcul du reste budgétaire et d'une dépense quotidienne prudente ;
- une projection de fin de mois ;
- un score de santé financière explicable ;
- le suivi du fonds d'urgence ;
- des alertes de dépassement et de dette ;
- un assistant conversationnel déterministe qui cite uniquement les données calculées ;
- un simulateur d'investissement éducatif ;
- une présentation des obligations, OPCVM et actions BVMAC ;
- des liens vers la BVMAC et le registre des intermédiaires COSUMAF.

Le profil de démonstration est conservé dans le stockage local du téléphone. En production, le mobile peut appeler les routes authentifiées :

- `POST /v1/financial-coach/analyze` ;
- `POST /v1/financial-coach/chat`.
- `GET /v1/financial-coach/profile` ;
- `PUT /v1/financial-coach/profile`.

Le moteur serveur se trouve dans `apps/api/src/domain/financial-coach.ts`. Il ne dépend pas d'un modèle génératif et reste disponible si un fournisseur d'IA est indisponible.

## Règle d'architecture IA

L'IA ne devient jamais l'autorité d'un montant financier. Le registre PostgreSQL, le moteur budgétaire déterministe et les règles de conformité produisent les chiffres. Un futur modèle génératif pourra reformuler les résultats, détecter une intention et expliquer un scénario, mais il ne pourra pas :

- inventer un solde ou un rendement ;
- modifier un budget sans confirmation ;
- initier un transfert sans confirmation forte ;
- passer un ordre de bourse directement ;
- présenter une hypothèse comme une garantie.

Les données envoyées à un futur modèle doivent être minimisées : agrégats par catégorie, montants nécessaires au scénario et identifiants pseudonymisés. Les numéros de téléphone, noms de bénéficiaires, jetons et références prestataires ne doivent jamais figurer dans le contexte du modèle.

## Fonctions volontairement verrouillées

| Fonction | Condition d'activation |
|---|---|
| dépôt et retrait Mobile Money | prestataire de services de paiement agréé, KYC/AML, webhooks et rapprochement |
| conservation de fonds | établissement habilité et cantonnement conforme |
| émission de carte | émetteur et processeur agréés |
| transmission ou exécution d'ordre | société de bourse ou établissement agréé COSUMAF |
| conseil personnalisé en investissement | cadre réglementaire, adéquation client et partenaire/statut adapté |

L'interface Investir reste donc éducative et ne comporte aucun bouton d'achat fictif.

## Étapes de production suivantes

1. Alimenter les catégories avec des transactions réelles et vérifiées.
2. Ajouter les consentements granulaires et leur historique dans PostgreSQL.
3. Ajouter les règles de récurrence, factures et prévisions à 7/30/90 jours.
4. Intégrer un fournisseur de modèle derrière une interface serveur, avec sortie JSON stricte et repli déterministe.
5. Effectuer une analyse d'impact sur la protection des données et publier les politiques applicables.
6. Contractualiser un prestataire de paiement puis un intermédiaire COSUMAF avant d'activer les opérations réglementées.

## Validation

- moteur financier couvert par tests unitaires ;
- API TypeScript compilée ;
- application mobile TypeScript validée ;
- parcours Coach et Investir contrôlés sur Expo Web ;
- aucune bordure décorative limitée à un côté n'a été introduite.
