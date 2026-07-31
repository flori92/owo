# Marchés régionaux owo!

owo! distingue explicitement les deux zones monétaires afin de ne jamais confondre deux devises qui portent toutes deux le nom « franc CFA » :

- CEMAC : XAF, avec le Cameroun comme marché par défaut ;
- UEMOA : XOF, avec une première configuration pour le Bénin, la Côte d'Ivoire et le Sénégal.

## Catalogue initial

| Pays | Zone | Devise | Opérateurs affichés |
| --- | --- | --- | --- |
| Cameroun | CEMAC | XAF | Orange Money, MTN Mobile Money |
| Bénin | UEMOA | XOF | MTN MoMo, Moov Money, Celtiis Cash |
| Côte d'Ivoire | UEMOA | XOF | Orange Money, MTN MoMo, Moov Money, Wave |
| Sénégal | UEMOA | XOF | Orange Money, Wave, Free Money |

Le catalogue mobile sert de configuration hors ligne. L'API reste l'autorité pour l'activation transactionnelle : un opérateur visible ne doit accepter de fonds réels qu'après intégration contractuelle, homologation technique et validation réglementaire locale.

## Comportement

- Le pays actif est persisté sur l'appareil sous `owo.market.v1`.
- Une API configurée reçoit le changement via `PATCH /v1/me/market`.
- Le serveur conserve `country_code`, `region_code` et `preferred_currency`.
- Le passage CEMAC/UEMOA crée le portefeuille XAF/XOF manquant sans effacer l'ancien portefeuille ni son historique comptable.
- Les paiements n'acceptent que XAF ou XOF.
- Le Coach owo! et le simulateur d'investissement adaptent la devise, la bourse et le régulateur : BVMAC/COSUMAF en CEMAC, BRVM/AMF-UMOA en UEMOA.

## Ajouter un pays

1. Ajouter le pays au catalogue mobile `src/config/markets.js`.
2. Ajouter le même code au catalogue API `src/domain/markets.ts` et au schéma de validation.
3. Étendre la contrainte SQL par une nouvelle migration additive.
4. Ajouter les formats téléphoniques et tests de non-régression.
5. Garder l'opérateur en lecture seule jusqu'à la validation du connecteur réel et des webhooks signés.

