# 📋 Instructions pour mettre à jour le solde de Floriace FAVI

## 🎯 Objectif
Mettre à jour le solde de Floriace FAVI à **13,500,000 FCFA**

## 🔧 Étapes manuelles dans Appwrite Console

### 1. Connexion à la console
- URL: https://cloud.appwrite.io/console/project-6915ff850039f714e80a
- Email: florifavi@gmail.com
- Password: OwoApp2024!

### 2. Mettre à jour les Wallets

#### Wallet MTN Mobile Money
- Aller dans: Database → owo_database → wallets
- Trouver le document avec `provider: "MTN Mobile Money"`
- Modifier `balance` → `8000000`

#### Wallet Orange Money  
- Trouver le document avec `provider: "Orange Money"`
- Modifier `balance` → `3500000`

#### Wallet ECOBANK CI
- Trouver le document avec `provider: "ECOBANK CI"`
- Modifier `balance` → `2000000`

### 3. Mettre à jour la Carte Virtuelle
- Aller dans: Database → owo_database → virtual_cards
- Trouver la carte de Floriace
- Modifier `balance` → `1500000`
- Modifier `dailyLimit` → `5000000`
- Modifier `monthlyLimit` → `50000000`

### 4. Mettre à jour l'Épargne Bloquée
- Aller dans: Database → owo_database → locked_savings
- Trouver l'épargne "Fonds d'urgence"
- Modifier `amount` → `5000000`
- Modifier `targetAmount` → `10000000`

### 5. Ajouter nouvelles transactions
- Aller dans: Database → owo_database → transactions
- Créer 3 nouvelles transactions:

```json
// Transaction 1: Dépôt initial
{
  "type": "deposit",
  "amount": 10000000,
  "recipientName": "Dépôt initial",
  "description": "Dépôt de départ sur le compte",
  "status": "completed"
}

// Transaction 2: Achat véhicule
{
  "type": "send", 
  "amount": 500000,
  "recipientPhone": "+2250700000000",
  "recipientName": "Jean Kouadio",
  "description": "Achat véhicule",
  "status": "completed"
}

// Transaction 3: Paiement projet
{
  "type": "receive",
  "amount": 3000000,
  "recipientPhone": "+2250800000000", 
  "recipientName": "Marie Aya",
  "description": "Paiement projet",
  "status": "completed"
}
```

### 6. Mettre à jour la Cagnotte
- Aller dans: Database → owo_database → group_savings
- Trouver "Voyage à Paris 2025"
- Modifier `targetAmount` → `2000000`

### 7. Ajouter notification système
- Aller dans: Database → owo_database → notifications
- Créer:

```json
{
  "type": "system",
  "title": "Compte mis à jour", 
  "message": "Votre solde a été ajusté à 13,500,000 FCFA",
  "read": true
}
```

## 📊 Résultat attendu

Après modifications, le dashboard affichera:

```
💰 Solde total: 13,500,000 FCFA
👛 MTN Mobile Money: 8,000,000 FCFA (principal)
👛 Orange Money: 3,500,000 FCFA  
🏦 ECOBANK CI: 2,000,000 FCFA
💳 Carte virtuelle: 1,500,000 FCFA
🔒 Épargne bloquée: 5,000,000 FCFA
🎯 Cagnotte: 75,000/2,000,000 FCFA
```

## ⚠️  Notes importantes

- Assurez-vous que le `userId` correspond bien à Floriace FAVI
- Vérifiez que les montants sont en FCFA (XOF)
- Testez dans l'app après modifications
- Le pull-to-refresh rafraîchira les données automatiquement
