#!/bin/bash

# 🚀 Script de configuration pour le développement OWO
# Ce script configure automatiquement l'environnement de développement

set -e

echo "🔧 Configuration de l'environnement de développement OWO..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ] && [ ! -f "firebase.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet OWO"
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Installer Firebase CLI si nécessaire
if ! command -v firebase &> /dev/null; then
    echo "📦 Installation de Firebase CLI..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI est déjà installé"
fi

# Créer les fichiers .env.local s'ils n'existent pas
if [ ! -f "apps/mobile/.env.local" ]; then
    echo "📝 Création du fichier .env.local pour mobile..."
    cp .env.example apps/mobile/.env.local
    echo "⚠️  N'oubliez pas de configurer vos clés API dans apps/mobile/.env.local"
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Création du fichier .env.local pour web..."
    cp .env.example apps/web/.env.local
    echo "⚠️  N'oubliez pas de configurer vos clés API dans apps/web/.env.local"
fi

# Installer les dépendances
echo "📦 Installation des dépendances mobile..."
cd apps/mobile && npm install
cd ../..

echo "📦 Installation des dépendances web..."
cd apps/web && npm install
cd ../..

echo "🔗 Vérification de la configuration Firebase..."
if command -v firebase &> /dev/null; then
    firebase projects:list 2>/dev/null || echo "⚠️  Vous devez vous connecter à Firebase: firebase login"
fi

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez vos clés API dans les fichiers .env.local"
echo "2. Connectez-vous à Firebase: firebase login"
echo "3. Lancez le développement mobile: cd apps/mobile && npm start"
echo "4. Lancez le développement web: cd apps/web && npm run dev"
echo ""
echo "📚 Consultez SECURITY.md pour plus d'informations sur la sécurité des clés API"
