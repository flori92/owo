#!/bin/bash

# ============================================
# Script de Configuration des Environnements - owo!
# ============================================
# Ce script copie les secrets vers les fichiers .env appropriés
# Usage: ./scripts/setup-env.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Configuration des environnements owo!"
echo "=========================================="

SECRETS_FILE="$PROJECT_ROOT/.secrets.local"

if [ ! -f "$SECRETS_FILE" ]; then
    echo "❌ Erreur: Le fichier .secrets.local n'existe pas!"
    echo "   Créez-le à partir de .env.example avec vos vraies clés."
    exit 1
fi

echo "✅ Fichier .secrets.local trouvé"

# Fonction pour extraire une variable du fichier secrets
get_secret() {
    grep "^$1=" "$SECRETS_FILE" | cut -d'=' -f2-
}

# Configuration Mobile
echo ""
echo "📱 Configuration de l'app Mobile..."
MOBILE_ENV="$PROJECT_ROOT/apps/mobile/.env.local"

cat > "$MOBILE_ENV" << EOF
# ============================================
# CONFIGURATION OWO! MOBILE - GÉNÉRÉ AUTOMATIQUEMENT
# ============================================
# NE PAS COMMITTER CE FICHIER

EXPO_PUBLIC_FIREBASE_API_KEY=$(get_secret "FIREBASE_API_KEY")
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=$(get_secret "FIREBASE_AUTH_DOMAIN")
EXPO_PUBLIC_FIREBASE_PROJECT_ID=$(get_secret "FIREBASE_PROJECT_ID")
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=$(get_secret "FIREBASE_STORAGE_BUCKET")
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(get_secret "FIREBASE_MESSAGING_SENDER_ID")
EXPO_PUBLIC_FIREBASE_APP_ID=$(get_secret "FIREBASE_APP_ID")
EXPO_PUBLIC_API_URL=$(get_secret "API_URL")
EXPO_PUBLIC_PRIVACY_POLICY_URL=$(get_secret "PRIVACY_POLICY_URL")
EXPO_PUBLIC_TERMS_URL=$(get_secret "TERMS_URL")
EXPO_PUBLIC_SUPPORT_URL=$(get_secret "SUPPORT_URL")
EXPO_PUBLIC_ACCOUNT_DELETION_URL=$(get_secret "ACCOUNT_DELETION_URL")
EXPO_PUBLIC_SUPPORT_EMAIL=$(get_secret "SUPPORT_EMAIL")
EXPO_PUBLIC_APP_MODE=production
EXPO_PUBLIC_AUTH_BYPASS=false
EXPO_PUBLIC_ENABLE_DEMO_MIGRATION=false
EOF

echo "   ✅ $MOBILE_ENV créé"

# Configuration Web
echo ""
echo "🌐 Configuration de l'app Web..."
WEB_ENV="$PROJECT_ROOT/apps/web/.env"

cat > "$WEB_ENV" << EOF
# ============================================
# CONFIGURATION OWO! WEB - GÉNÉRÉ AUTOMATIQUEMENT
# ============================================
# NE PAS COMMITTER CE FICHIER

VITE_FIREBASE_API_KEY=$(get_secret "FIREBASE_API_KEY")
VITE_FIREBASE_AUTH_DOMAIN=$(get_secret "FIREBASE_AUTH_DOMAIN")
VITE_FIREBASE_PROJECT_ID=$(get_secret "FIREBASE_PROJECT_ID")
VITE_FIREBASE_STORAGE_BUCKET=$(get_secret "FIREBASE_STORAGE_BUCKET")
VITE_FIREBASE_MESSAGING_SENDER_ID=$(get_secret "FIREBASE_MESSAGING_SENDER_ID")
VITE_FIREBASE_APP_ID=$(get_secret "FIREBASE_APP_ID")
DATABASE_URL=$(get_secret "DATABASE_URL")
VITE_ENV=development
EOF

echo "   ✅ $WEB_ENV créé"

# Configuration API
echo ""
echo "🔐 Configuration de l'API..."
API_ENV="$PROJECT_ROOT/apps/api/.env"

cat > "$API_ENV" << EOF
# Généré automatiquement. Ne pas committer.
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
DATABASE_URL=$(get_secret "DATABASE_URL")
DATABASE_SSL=$(get_secret "DATABASE_SSL")
FIREBASE_PROJECT_ID=$(get_secret "FIREBASE_PROJECT_ID")
CORS_ORIGINS=$(get_secret "CORS_ORIGINS")
LOG_LEVEL=info
TRUST_PROXY=false
EOF

echo "   ✅ $API_ENV créé"

echo ""
echo "=========================================="
echo "✅ Configuration terminée!"
echo ""
echo "Les fichiers suivants ont été créés:"
echo "  - apps/mobile/.env.local"
echo "  - apps/web/.env"
echo "  - apps/api/.env"
echo ""
echo "⚠️  Ces fichiers sont ignorés par git et ne seront pas commités."
