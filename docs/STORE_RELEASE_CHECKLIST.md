# Checklist de mise en production iOS et Android

## Technique

- [ ] `cd apps/mobile && npm ci`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run validate:config`
- [ ] `npm run release:check`
- [ ] `cd apps/api && npm ci && npm run check`
- [ ] appliquer les migrations PostgreSQL puis déployer le conteneur API sur Cloud Run
- [ ] vérifier `/health/ready`, les secrets, le pool SQL, les sauvegardes et les alertes
- [ ] déployer `firestore.rules`, les index et les Cloud Functions
- [ ] tester la demande de suppression de compte déployée
- [ ] créer un build `preview` sur iPhone et Android physiques
- [ ] vérifier inscription, connexion persistante, déconnexion et récupération de mot de passe
- [ ] vérifier les écrans en réseau lent, hors ligne et après expiration de session
- [ ] désactiver définitivement `EXPO_PUBLIC_AUTH_BYPASS` et `EXPO_PUBLIC_ENABLE_DEMO_MIGRATION`

## Sécurité et finance

- [ ] révoquer les anciens secrets mentionnés dans `SECURITY_ALERT.md`
- [ ] restreindre les clés Google/Firebase aux Bundle ID et package autorisés
- [ ] activer App Check, la journalisation, les alertes et une procédure d'incident
- [ ] faire auditer les règles Firestore et les Cloud Functions
- [ ] ne jamais embarquer une URL PostgreSQL/Neon, un compte de service ou une clé privée dans l'app
- [ ] tester les contraintes du registre, l'idempotence, les annulations et le rapprochement de l'API
- [ ] vérifier signature et anti-rejeu des webhooks de chaque prestataire
- [ ] conclure les contrats avec les opérateurs Mobile Money et effectuer KYC/AML selon les pays ciblés
- [ ] publier l'app financière depuis l'entité juridique qui fournit le service

## Données et conformité

- [ ] publier une politique de confidentialité HTTPS
- [ ] publier des conditions d'utilisation HTTPS
- [ ] publier une page HTTPS de support
- [ ] publier une page Web de suppression de compte accessible sans connexion
- [ ] expliquer la conservation réglementaire des données financières
- [ ] remplir App Privacy (Apple) et Data safety (Google) conformément aux SDK réellement activés
- [ ] documenter le responsable de traitement et le contact vie privée

## App Store Connect

- [ ] compte Apple Developer au nom de l'entité juridique
- [ ] Bundle ID `com.floriace.owo` enregistré
- [ ] fiche App Store créée et identifiant ASC ajouté au profil EAS si automatisation CI
- [ ] captures iPhone, icône, description, mots-clés, catégorie et classification d'âge
- [ ] URL de confidentialité et URL de support
- [ ] compte de revue et notes expliquant les fonctions financières
- [ ] build TestFlight validé avant soumission en revue

## Google Play Console

- [ ] compte développeur et vérification de l'organisation terminés
- [ ] application `com.owo.app` créée
- [ ] premier AAB chargé puis Play App Signing activé
- [ ] accès du compte de service configuré pour EAS Submit
- [ ] fiche Play Store, captures, icône 512 px et bannière
- [ ] formulaire Data safety, contenu financier et déclaration d'accès à l'app complétés
- [ ] URL de suppression de compte ajoutée dans Play Console
- [ ] release interne testée, puis promotion progressive en production

## Go / no-go

La publication publique est un **no-go** tant qu'un mouvement de fonds affiché comme réel peut être créé ou modifier un solde uniquement depuis le client. Dans ce cas, déplacer l'opération vers une API authentifiée, idempotente et atomique, avec rapprochement auprès du prestataire de paiement.
