#!/bin/bash

# Script de configuration de la base de données Appwrite pour owo!
# Usage: ./scripts/setup-appwrite.sh

set -e

echo "🚀 Configuration de la base de données Appwrite pour owo!"
echo "=================================================="

PROJECT_ID="6915ff850039f714e80a"
DATABASE_ID="owo_database"

# Configurer le client
appwrite client --endpoint https://fra.cloud.appwrite.io/v1 --project-id $PROJECT_ID

echo ""
echo "📦 Création de la base de données..."
appwrite databases create --database-id $DATABASE_ID --name "owo! Database" || echo "Base de données existe déjà"

echo ""
echo "📋 Création des collections..."

# Collection: profiles
echo "  → profiles"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "profiles" \
  --name "Profiles" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection profiles existe déjà"

# Attributs pour profiles
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "email" --size 255 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "phone" --size 20 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "firstName" --size 100 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "lastName" --size 100 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "avatarUrl" --size 500 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "country" --size 5 --required false --default "CI" || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "currency" --size 5 --required false --default "XOF" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "createdAt" --required false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "profiles" --key "updatedAt" --required false || true

# Collection: wallets
echo "  → wallets"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "wallets" \
  --name "Wallets" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection wallets existe déjà"

# Attributs pour wallets
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "type" --size 20 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "provider" --size 50 --required true || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "balance" --required false --default 0 || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "currency" --size 5 --required false --default "XOF" || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "accountNumber" --size 50 --required false || true
appwrite databases create-boolean-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "isPrimary" --required false --default false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "status" --size 20 --required false --default "active" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "wallets" --key "createdAt" --required false || true

# Collection: transactions
echo "  → transactions"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "transactions" \
  --name "Transactions" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection transactions existe déjà"

# Attributs pour transactions
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "walletId" --size 36 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "type" --size 20 --required true || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "amount" --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "currency" --size 5 --required false --default "XOF" || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "fee" --required false --default 0 || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "status" --size 20 --required false --default "pending" || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "recipientPhone" --size 20 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "recipientName" --size 100 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "description" --size 500 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "reference" --size 50 --required false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "createdAt" --required false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "transactions" --key "completedAt" --required false || true

# Collection: group_savings
echo "  → group_savings"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "group_savings" \
  --name "Group Savings" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection group_savings existe déjà"

# Attributs pour group_savings
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "code" --size 20 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "name" --size 100 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "description" --size 500 --required false || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "targetAmount" --required false || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "currentAmount" --required false --default 0 || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "currency" --size 5 --required false --default "XOF" || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "creatorId" --size 36 --required true || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "endDate" --required false || true
appwrite databases create-boolean-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "isPublic" --required false --default false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "status" --size 20 --required false --default "active" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "group_savings" --key "createdAt" --required false || true

# Collection: group_members
echo "  → group_members"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "group_members" \
  --name "Group Members" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection group_members existe déjà"

# Attributs pour group_members
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_members" --key "groupId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_members" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "group_members" --key "role" --size 20 --required false --default "member" || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "group_members" --key "contributedAmount" --required false --default 0 || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "group_members" --key "joinedAt" --required false || true

# Collection: locked_savings
echo "  → locked_savings"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "locked_savings" \
  --name "Locked Savings" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection locked_savings existe déjà"

# Attributs pour locked_savings
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "title" --size 100 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "description" --size 500 --required false || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "amount" --required true || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "targetAmount" --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "currency" --size 5 --required false --default "XOF" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "unlockDate" --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "emergencyPin" --size 100 --required false || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "status" --size 20 --required false --default "locked" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "createdAt" --required false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "locked_savings" --key "unlockedAt" --required false || true

# Collection: virtual_cards
echo "  → virtual_cards"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "virtual_cards" \
  --name "Virtual Cards" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection virtual_cards existe déjà"

# Attributs pour virtual_cards
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "cardNumber" --size 100 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "expiryDate" --size 10 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "cvv" --size 100 --required true || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "balance" --required false --default 0 || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "dailyLimit" --required false --default 1000 || true
appwrite databases create-float-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "monthlyLimit" --required false --default 5000 || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "status" --size 20 --required false --default "active" || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "virtual_cards" --key "createdAt" --required false || true

# Collection: notifications
echo "  → notifications"
appwrite databases create-collection \
  --database-id $DATABASE_ID \
  --collection-id "notifications" \
  --name "Notifications" \
  --permissions 'read("users")' 'write("users")' \
  --document-security true || echo "  Collection notifications existe déjà"

# Attributs pour notifications
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "userId" --size 36 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "type" --size 50 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "title" --size 200 --required true || true
appwrite databases create-string-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "message" --size 500 --required false || true
appwrite databases create-boolean-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "read" --required false --default false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "createdAt" --required false || true
appwrite databases create-datetime-attribute --database-id $DATABASE_ID --collection-id "notifications" --key "readAt" --required false || true

echo ""
echo "🔍 Création des index..."

# Index pour wallets
appwrite databases create-index --database-id $DATABASE_ID --collection-id "wallets" --key "userId_idx" --type key --attributes userId || true

# Index pour transactions
appwrite databases create-index --database-id $DATABASE_ID --collection-id "transactions" --key "userId_idx" --type key --attributes userId || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "transactions" --key "reference_idx" --type unique --attributes reference || true

# Index pour group_savings
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_savings" --key "code_idx" --type unique --attributes code || true

# Index pour group_members
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_members" --key "groupId_idx" --type key --attributes groupId || true
appwrite databases create-index --database-id $DATABASE_ID --collection-id "group_members" --key "userId_idx" --type key --attributes userId || true

# Index pour locked_savings
appwrite databases create-index --database-id $DATABASE_ID --collection-id "locked_savings" --key "userId_idx" --type key --attributes userId || true

# Index pour virtual_cards
appwrite databases create-index --database-id $DATABASE_ID --collection-id "virtual_cards" --key "userId_idx" --type key --attributes userId || true

# Index pour notifications
appwrite databases create-index --database-id $DATABASE_ID --collection-id "notifications" --key "userId_idx" --type key --attributes userId || true

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
