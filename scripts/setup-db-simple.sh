#!/bin/bash

# Script simplifié pour créer la base de données Appwrite
# Usage: ./scripts/setup-db-simple.sh

echo "🚀 Configuration de la base de données Appwrite pour owo!"
echo "=================================================="

# Configuration
PROJECT_ID="6915ff850039f714e80a"
DATABASE_ID="owo_database"

# Vérifier la connexion
echo "🔍 Vérification de la connexion..."
if ! appwrite account get &>/dev/null; then
    echo "❌ Non connecté. Lance 'appwrite login' d'abord."
    exit 1
fi

# Configurer le client
appwrite client --endpoint https://fra.cloud.appwrite.io/v1 --project-id $PROJECT_ID

echo ""
echo "📦 Création de la base de données..."
appwrite databases create --database-id $DATABASE_ID --name "owo! Database" 2>/dev/null || echo "Base de données existe déjà"

echo ""
echo "📋 Création des collections..."

# Fonction pour créer une collection
create_collection() {
    local collection_id=$1
    local name=$2
    
    echo "  → $name"
    appwrite databases create-collection \
        --database-id $DATABASE_ID \
        --collection-id $collection_id \
        --name "$name" \
        --permissions 'read("users")' 'write("users")' \
        --document-security true 2>/dev/null || echo "    Collection $name existe déjà"
}

# Créer les collections
create_collection "profiles" "Profiles"
create_collection "wallets" "Wallets"
create_collection "transactions" "Transactions"
create_collection "group_savings" "Group Savings"
create_collection "group_members" "Group Members"
create_collection "locked_savings" "Locked Savings"
create_collection "virtual_cards" "Virtual Cards"
create_collection "notifications" "Notifications"

echo ""
echo "⚙️  Création des attributs..."

# Fonction pour créer un attribut string
create_string_attr() {
    local collection=$1
    local key=$2
    local size=${3:-255}
    local required=${4:-false}
    
    appwrite databases create-string-attribute \
        --database-id $DATABASE_ID \
        --collection-id $collection \
        --key $key \
        --size $size \
        --required $required 2>/dev/null || true
}

# Fonction pour créer un attribut float
create_float_attr() {
    local collection=$1
    local key=$2
    local required=${3:-false}
    local default=${4:-0}
    
    appwrite databases create-float-attribute \
        --database-id $DATABASE_ID \
        --collection-id $collection \
        --key $key \
        --required $required \
        --default $default 2>/dev/null || true
}

# Fonction pour créer un attribut boolean
create_bool_attr() {
    local collection=$1
    local key=$2
    local default=${3:-false}
    
    appwrite databases create-boolean-attribute \
        --database-id $DATABASE_ID \
        --collection-id $collection \
        --key $key \
        --default $default 2>/dev/null || true
}

# Fonction pour créer un attribut datetime
create_datetime_attr() {
    local collection=$1
    local key=$2
    local required=${3:-false}
    
    appwrite databases create-datetime-attribute \
        --database-id $DATABASE_ID \
        --collection-id $collection \
        --key $key \
        --required $required 2>/dev/null || true
}

echo "  → profiles"
create_string_attr "profiles" "email"
create_string_attr "profiles" "phone" 20
create_string_attr "profiles" "firstName" 100
create_string_attr "profiles" "lastName" 100
create_string_attr "profiles" "avatarUrl" 500
create_string_attr "profiles" "country" 5
create_string_attr "profiles" "currency" 5
create_datetime_attr "profiles" "createdAt"
create_datetime_attr "profiles" "updatedAt"

echo "  → wallets"
create_string_attr "wallets" "userId" 36 true
create_string_attr "wallets" "type" 20 true
create_string_attr "wallets" "provider" 50 true
create_float_attr "wallets" "balance"
create_string_attr "wallets" "currency" 5
create_string_attr "wallets" "accountNumber" 50
create_bool_attr "wallets" "isPrimary"
create_string_attr "wallets" "status" 20
create_datetime_attr "wallets" "createdAt"

echo "  → transactions"
create_string_attr "transactions" "userId" 36 true
create_string_attr "transactions" "walletId" 36
create_string_attr "transactions" "type" 20 true
create_float_attr "transactions" "amount" true
create_string_attr "transactions" "currency" 5
create_float_attr "transactions" "fee"
create_string_attr "transactions" "status" 20
create_string_attr "transactions" "recipientPhone" 20
create_string_attr "transactions" "recipientName" 100
create_string_attr "transactions" "description" 500
create_string_attr "transactions" "reference" 50
create_datetime_attr "transactions" "createdAt"
create_datetime_attr "transactions" "completedAt"

echo "  → group_savings"
create_string_attr "group_savings" "code" 20 true
create_string_attr "group_savings" "name" 100 true
create_string_attr "group_savings" "description" 500
create_float_attr "group_savings" "targetAmount"
create_float_attr "group_savings" "currentAmount"
create_string_attr "group_savings" "currency" 5
create_string_attr "group_savings" "creatorId" 36 true
create_datetime_attr "group_savings" "endDate"
create_bool_attr "group_savings" "isPublic"
create_string_attr "group_savings" "status" 20
create_datetime_attr "group_savings" "createdAt"

echo "  → group_members"
create_string_attr "group_members" "groupId" 36 true
create_string_attr "group_members" "userId" 36 true
create_string_attr "group_members" "role" 20
create_float_attr "group_members" "contributedAmount"
create_datetime_attr "group_members" "joinedAt"

echo "  → locked_savings"
create_string_attr "locked_savings" "userId" 36 true
create_string_attr "locked_savings" "title" 100 true
create_string_attr "locked_savings" "description" 500
create_float_attr "locked_savings" "amount" true
create_float_attr "locked_savings" "targetAmount"
create_string_attr "locked_savings" "currency" 5
create_datetime_attr "locked_savings" "unlockDate" true
create_string_attr "locked_savings" "emergencyPin" 100
create_string_attr "locked_savings" "status" 20
create_datetime_attr "locked_savings" "createdAt"
create_datetime_attr "locked_savings" "unlockedAt"

echo "  → virtual_cards"
create_string_attr "virtual_cards" "userId" 36 true
create_string_attr "virtual_cards" "cardNumber" 100 true
create_string_attr "virtual_cards" "expiryDate" 10 true
create_string_attr "virtual_cards" "cvv" 100 true
create_float_attr "virtual_cards" "balance"
create_float_attr "virtual_cards" "dailyLimit" false 1000
create_float_attr "virtual_cards" "monthlyLimit" false 5000
create_string_attr "virtual_cards" "status" 20
create_datetime_attr "virtual_cards" "createdAt"

echo "  → notifications"
create_string_attr "notifications" "userId" 36 true
create_string_attr "notifications" "type" 50 true
create_string_attr "notifications" "title" 200 true
create_string_attr "notifications" "message" 500
create_bool_attr "notifications" "read"
create_datetime_attr "notifications" "createdAt"
create_datetime_attr "notifications" "readAt"

echo ""
echo "🔍 Création des index..."

# Créer les index
appwrite databases create-index --database-id $DATABASE_ID --collection-id "wallets" --key "userId_idx" --type key --attributes userId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "transactions" --key "userId_idx" --type key --attributes userId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "transactions" --key "reference_idx" --type unique --attributes reference 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_savings" --key "code_idx" --type unique --attributes code 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_members" --key "groupId_idx" --type key --attributes groupId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_members" --key "userId_idx" --type key --attributes userId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "locked_savings" --key "userId_idx" --type key --attributes userId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "virtual_cards" --key "userId_idx" --type key --attributes userId 2>/dev/null || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "notifications" --key "userId_idx" --type key --attributes userId 2>/dev/null || true

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📊 Résumé des collections créées:"
echo "   - profiles       : Profils utilisateurs"
echo "   - wallets        : Portefeuilles (Mobile Money, Banques)"
echo "   - transactions   : Historique des transactions"
echo "   - group_savings  : Cagnottes"
echo "   - group_members  : Membres des cagnottes"
echo "   - locked_savings : Épargne bloquée"
echo "   - virtual_cards  : Cartes virtuelles"
echo "   - notifications  : Notifications"
echo ""
echo "🔗 Console Appwrite: https://cloud.appwrite.io/console/project-$PROJECT_ID"
