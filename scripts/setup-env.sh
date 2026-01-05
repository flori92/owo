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

EXPO_PUBLIC_FIREBASE_API_KEY=$(get_secret "EXPO_PUBLIC_FIREBASE_API_KEY")
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=$(get_secret "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN")
EXPO_PUBLIC_FIREBASE_PROJECT_ID=$(get_secret "EXPO_PUBLIC_FIREBASE_PROJECT_ID")
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=$(get_secret "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET")
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(get_secret "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
EXPO_PUBLIC_FIREBASE_APP_ID=$(get_secret "EXPO_PUBLIC_FIREBASE_APP_ID")
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=$(get_secret "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID")
EXPO_PUBLIC_GEMINI_API_KEY=$(get_secret "EXPO_PUBLIC_GEMINI_API_KEY")
EXPO_PUBLIC_NEON_DATABASE_URL=$(get_secret "NEON_DATABASE_URL")
EXPO_PUBLIC_ENV=development
NODE_ENV=development
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

VITE_FIREBASE_API_KEY=$(get_secret "VITE_FIREBASE_API_KEY")
VITE_FIREBASE_AUTH_DOMAIN=$(get_secret "VITE_FIREBASE_AUTH_DOMAIN")
VITE_FIREBASE_PROJECT_ID=$(get_secret "VITE_FIREBASE_PROJECT_ID")
VITE_FIREBASE_STORAGE_BUCKET=$(get_secret "VITE_FIREBASE_STORAGE_BUCKET")
VITE_FIREBASE_MESSAGING_SENDER_ID=$(get_secret "VITE_FIREBASE_MESSAGING_SENDER_ID")
VITE_FIREBASE_APP_ID=$(get_secret "VITE_FIREBASE_APP_ID")
VITE_FIREBASE_MEASUREMENT_ID=$(get_secret "VITE_FIREBASE_MEASUREMENT_ID")
NEON_DATABASE_URL=$(get_secret "NEON_DATABASE_URL")
VITE_ENV=development
EOF

echo "   ✅ $WEB_ENV créé"

echo ""
echo "=========================================="
echo "✅ Configuration terminée!"
echo ""
echo "Les fichiers suivants ont été créés:"
echo "  - apps/mobile/.env.local"
echo "  - apps/web/.env"
echo ""
echo "⚠️  Ces fichiers sont ignorés par git et ne seront pas commités."
