# 🚨 ALERTE DE SÉCURITÉ CRITIQUE - OWO!

**Date**: 2025-12-03
**Statut**: URGENT - ACTION IMMÉDIATE REQUISE
**Sévérité**: CRITIQUE (10/10)

---

## ⚠️ RÉSUMÉ EXÉCUTIF

Plusieurs fichiers sensibles contenant des clés API et credentials ont été commis dans le repository Git. **Ceci constitue une vulnérabilité de sécurité CRITIQUE** qui doit être corrigée IMMÉDIATEMENT.

**Impact**: Accès non autorisé complet à:
- Base de données Firebase (lecture/écriture/suppression)
- Comptes utilisateurs et données financières
- Cloud Functions
- Storage
- Authentication
- APIs tierces (Gemini AI, Appwrite)

---

## 🔥 ACTIONS IMMÉDIATES REQUISES (À FAIRE MAINTENANT)

### 1. RÉVOQUER TOUTES LES CLÉS EXPOSÉES

#### A. Firebase Service Account Key
**Fichier exposé**: `service-account-key.json`
**Clé exposée**: `firebase-adminsdk-fbsvc@owo-631ab.iam.gserviceaccount.com`

**Actions**:
```bash
# 1. Aller sur Firebase Console
https://console.firebase.google.com/project/owo-631ab/settings/serviceaccounts/adminsdk

# 2. Dans l'onglet "Service Accounts", trouver:
#    firebase-adminsdk-fbsvc@owo-631ab.iam.gserviceaccount.com
#
# 3. Supprimer toutes les clés de ce compte

# 4. Dans Google Cloud Console IAM:
https://console.cloud.google.com/iam-admin/serviceaccounts?project=owo-631ab

# 5. Désactiver ou supprimer le service account
#    firebase-adminsdk-fbsvc@owo-631ab.iam.gserviceaccount.com
```

#### B. Firebase API Keys
**Fichiers exposés**: `apps/mobile/.env`, `apps/mobile/.env.local`
**Clés exposées**:
- `AIzaSyCHL0m44l-XMkJznGE214toOvxdYzN5i6g` (Firebase API Key 1)
- `AIzaSyBCbYFiWrnSlNvL_8XoAky6ZshsKnlxHQ0` (Firebase API Key 2)

**Actions**:
```bash
# 1. Aller sur Firebase Console
https://console.firebase.google.com/project/owo-631ab/settings/general

# 2. Dans "Vos applications" → Web app → Config
# 3. Regénérer les clés API
# 4. Restreindre les clés API dans Google Cloud Console:
https://console.cloud.google.com/apis/credentials?project=owo-631ab

# 5. Pour chaque clé API:
#    - Restrictions d'application (HTTP referrers pour web, iOS/Android pour mobile)
#    - Restrictions d'API (Firebase uniquement)
```

#### C. Gemini API Key
**Fichier exposé**: `apps/mobile/.env`
**Clé exposée**: `AIzaSyCLlC9Eko6ZBvR0bbYEzZD7ucqzGJshZGE`

**Actions**:
```bash
# 1. Aller sur Google AI Studio
https://makersuite.google.com/app/apikey

# 2. Révoquer la clé exposée
# 3. Créer une nouvelle clé
# 4. Ajouter des restrictions d'API
```

#### D. Appwrite API Key
**Fichier exposé**: `apps/mobile/.env`
**Clé exposée**: `standard_7069172c1dfad4fbd791edc2814f129887169e0858f95bd395a66adb9b032c7103a107e9b46b4b22ed7019a5db9892ea520ef7e0ab15f50d23890c84b02652ece06ec91e6ff13ef7ab50b9f4e835a35487a14169ff2316204df2abdf46cb436b490b36f4d3b860b9e1c4b5f7b0d6b6e730b90b32622b75b0fd4625349faf2543`

**Actions**:
```bash
# Si Appwrite est encore utilisé:
# 1. Aller sur Appwrite Console
# 2. API Keys → Révoquer la clé exposée
# 3. Créer une nouvelle clé avec permissions minimales

# Si Appwrite n'est plus utilisé (recommandé):
# - Supprimer complètement le compte/projet Appwrite
```

---

### 2. NETTOYER LE REPOSITORY GIT

```bash
cd /Users/floriace/owo!/owo

# 1. Supprimer les fichiers sensibles du working directory
rm -f service-account-key.json
rm -f apps/mobile/.env
rm -f apps/mobile/.env.local

# 2. Supprimer de l'index Git
git rm --cached service-account-key.json
git rm --cached apps/mobile/.env
git rm --cached apps/mobile/.env.local

# 3. Vérifier que .gitignore est bien configuré
cat .gitignore | grep "service-account-key.json"
cat .gitignore | grep ".env"

# 4. Commit les changements
git add .gitignore
git commit -m "security: remove exposed credentials and update .gitignore"

# 5. IMPORTANT: Supprimer l'historique Git contenant les clés
# Option A (recommandée): Utiliser BFG Repo-Cleaner
git clone --mirror git://your-repo-url repo.git
java -jar bfg.jar --delete-files service-account-key.json repo.git
java -jar bfg.jar --delete-files .env repo.git
cd repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Option B: Utiliser git-filter-branch (plus lent)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch service-account-key.json apps/mobile/.env apps/mobile/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
git push --force --tags
```

---

### 3. AUDITER LES ACCÈS

```bash
# 1. Vérifier les logs d'authentification Firebase
# Aller sur Firebase Console → Authentication → Users
# Rechercher des comptes suspects créés récemment

# 2. Vérifier les logs d'accès Firestore
# Aller sur Firebase Console → Firestore → Usage

# 3. Vérifier les logs Cloud Functions
# Aller sur Firebase Console → Functions → Logs
# Rechercher des invocations suspectes

# 4. Vérifier la facturation/usage
https://console.firebase.google.com/project/owo-631ab/usage

# 5. Vérifier les logs d'audit Google Cloud
https://console.cloud.google.com/logs/query?project=owo-631ab
```

---

### 4. CRÉER DE NOUVELLES CLÉS SÉCURISÉES

#### A. Nouveau Service Account Key
```bash
# 1. Créer un NOUVEAU service account avec permissions minimales
# 2. Télécharger la clé
# 3. Stocker dans un gestionnaire de secrets:
#    - Pas dans le repo!
#    - Utiliser Google Secret Manager
#    - Ou variables d'environnement sécurisées (CI/CD)

# 4. Pour le développement local:
# Créer un fichier service-account-key.json LOCAL uniquement
# S'assurer qu'il est dans .gitignore
```

#### B. Nouvelles Firebase API Keys
```bash
# 1. Créer de nouvelles clés avec restrictions:
#    - Application restrictions (bundle ID/package name)
#    - API restrictions (Firebase APIs only)
#    - Rate limiting

# 2. Stocker dans .env.example (avec valeurs factices)
# 3. Utiliser .env.local pour les vraies valeurs (gitignored)
```

---

### 5. METTRE À JOUR LES CONFIGURATIONS

```bash
# 1. Créer apps/mobile/.env.example avec placeholders
cat > apps/mobile/.env.example << 'EOF'
# ============================================
# FIREBASE CONFIGURATION
# ============================================
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ============================================
# GEMINI AI (OPTIONAL)
# ============================================
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# ============================================
# ENVIRONMENT
# ============================================
EXPO_PUBLIC_ENV=production
EOF

# 2. Copier vers .env.local et remplir avec vraies valeurs
cp apps/mobile/.env.example apps/mobile/.env.local
# Éditer .env.local avec les NOUVELLES clés

# 3. Commit uniquement .env.example
git add apps/mobile/.env.example
git commit -m "docs: add .env.example template"
```

---

## 📋 CHECKLIST DE SÉCURITÉ

### Actions Immédiates ✅
- [ ] Révoquer service-account-key.json
- [ ] Révoquer Firebase API keys (les 2)
- [ ] Révoquer Gemini API key
- [ ] Révoquer/supprimer Appwrite API key
- [ ] Supprimer fichiers sensibles du repo
- [ ] Nettoyer l'historique Git
- [ ] Force push le repo nettoyé
- [ ] Auditer les logs d'accès Firebase
- [ ] Vérifier la facturation pour usage suspect

### Configuration Sécurisée ✅
- [ ] Créer nouveau service account avec permissions minimales
- [ ] Générer nouvelles Firebase API keys avec restrictions
- [ ] Créer nouveau Gemini API key (si nécessaire)
- [ ] Configurer .env.example (template)
- [ ] Configurer .env.local (valeurs réelles, gitignored)
- [ ] Vérifier .gitignore contient tous les patterns sensibles
- [ ] Documenter le processus de configuration pour l'équipe

### Sécurité Continue ✅
- [ ] Activer 2FA sur tous les comptes Google/Firebase
- [ ] Configurer les alertes de sécurité Firebase
- [ ] Mettre en place un scan de sécurité automatique (git-secrets)
- [ ] Former l'équipe sur les bonnes pratiques
- [ ] Établir un processus de revue de code
- [ ] Configurer le pre-commit hook pour bloquer les secrets

---

## 🔒 PRÉVENTION FUTURE

### 1. Installer git-secrets
```bash
# Installer git-secrets
brew install git-secrets  # macOS
# ou
apt-get install git-secrets  # Linux

# Configurer pour le projet
cd /Users/floriace/owo!/owo
git secrets --install
git secrets --register-aws
git secrets --add 'private_key'
git secrets --add 'api_key'
git secrets --add 'service-account'
git secrets --add '[A-Za-z0-9+/]{40,}'  # Patterns de clés
```

### 2. Pre-commit Hook
Créer `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Vérifier qu'aucun fichier sensible n'est commité

FILES=(
  "service-account-key.json"
  ".env"
  ".env.local"
  "*.pem"
  "*.key"
)

for file in "${FILES[@]}"; do
  if git diff --cached --name-only | grep -q "$file"; then
    echo "❌ ERREUR: Tentative de commit d'un fichier sensible: $file"
    echo "Ce fichier ne doit JAMAIS être commité."
    exit 1
  fi
done

# Rechercher des patterns de clés API
if git diff --cached | grep -E '(AIza[0-9A-Za-z-_]{35}|firebase_admin|private_key)' > /dev/null; then
  echo "❌ ERREUR: Possible clé API détectée dans le commit"
  echo "Vérifiez que vous ne commitez pas de credentials."
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
```

```bash
chmod +x .git/hooks/pre-commit
```

### 3. Rotation Régulière des Clés
- Rotation trimestrielle des service account keys
- Rotation mensuelle des API keys
- Audit mensuel des permissions

### 4. Monitoring
- Configurer Google Cloud Security Command Center
- Activer les alertes d'accès anormaux
- Surveiller les logs quotidiennement

---

## 📞 EN CAS DE PROBLÈME

Si vous détectez une activité suspecte:

1. **Immédiatement**: Révoquer TOUTES les clés
2. **Contacter**: L'équipe de sécurité Firebase
3. **Documenter**: Tous les incidents dans un rapport
4. **Notifier**: Les utilisateurs si leurs données ont été compromises (obligation RGPD)

---

## 📚 RESSOURCES

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [Google Cloud IAM Best Practices](https://cloud.google.com/iam/docs/best-practices-for-using-and-managing-service-account-keys)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_CheatSheet.html)
- [Git-secrets](https://github.com/awslabs/git-secrets)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

**⚠️ Ce document contient des informations de sécurité critiques. Ne PAS commiter dans le repository public.**

**✅ Une fois toutes les actions effectuées, renommer ce fichier en SECURITY_ALERT_RESOLVED.md**
