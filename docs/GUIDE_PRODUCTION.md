# 🚀 Guide de passage en mode Production - owo!

Ce guide détaille les étapes pour transformer l'application owo! du mode démo actuel vers une application de production complète avec backend et base de données.

## 📋 Table des matières

1. [Architecture recommandée](#architecture-recommandée)
2. [Option 1 : Supabase (Recommandé)](#option-1--supabase-recommandé)
3. [Option 2 : Firebase](#option-2--firebase)
4. [Option 3 : Backend personnalisé](#option-3--backend-personnalisé)
5. [Intégrations de paiement](#intégrations-de-paiement)
6. [Sécurité](#sécurité)
7. [Checklist de déploiement](#checklist-de-déploiement)

---

## 🏗️ Architecture recommandée

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Mobile                        │
│                    (React Native/Expo)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              (Supabase / Firebase / Custom)                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   Auth   │ │ Database │ │ Storage  │
    │ Service  │ │ (Postgres│ │ (Files)  │
    │          │ │ /Firestore│ │          │
    └──────────┘ └──────────┘ └──────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Intégrations Paiement                           │
│    (Mobile Money APIs / Stripe / Wave / Orange Money)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🥇 Option 1 : Supabase (Recommandé)

Supabase est la solution la plus adaptée pour owo! car elle offre :
- Base de données PostgreSQL
- Authentification intégrée
- API REST et temps réel
- Row Level Security (RLS)
- Edge Functions pour la logique métier

### Étape 1 : Créer un projet Supabase

```bash
# Installer le CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Initialiser dans le projet
cd /Users/floriace/owo!/owo
supabase init
```

### Étape 2 : Schéma de base de données

Créer les migrations dans `supabase/migrations/` :

```sql
-- 001_users.sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  country TEXT DEFAULT 'CI',
  currency TEXT DEFAULT 'XOF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

```sql
-- 002_wallets.sql
CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mobile_money', 'bank', 'virtual_card')),
  provider TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  account_number TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);
```

```sql
-- 003_transactions.sql
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  wallet_id UUID REFERENCES public.wallets(id),
  type TEXT NOT NULL CHECK (type IN ('send', 'receive', 'deposit', 'withdraw', 'payment')),
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'XOF',
  fee DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  recipient_phone TEXT,
  recipient_name TEXT,
  description TEXT,
  reference TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
```

```sql
-- 004_group_savings.sql
CREATE TABLE public.group_savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  creator_id UUID REFERENCES public.profiles(id),
  end_date DATE,
  is_public BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.group_savings_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.group_savings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  contributed_amount DECIMAL(15,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

```sql
-- 005_locked_savings.sql
CREATE TABLE public.locked_savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  target_amount DECIMAL(15,2),
  currency TEXT DEFAULT 'XOF',
  unlock_date DATE NOT NULL,
  emergency_pin_hash TEXT,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'mature')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ
);

ALTER TABLE public.locked_savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings" ON public.locked_savings
  FOR SELECT USING (auth.uid() = user_id);
```

```sql
-- 006_virtual_cards.sql
CREATE TABLE public.virtual_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  card_number_encrypted TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cvv_encrypted TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  daily_limit DECIMAL(15,2) DEFAULT 1000,
  monthly_limit DECIMAL(15,2) DEFAULT 5000,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Étape 3 : Installer le client Supabase

```bash
cd apps/mobile
npm install @supabase/supabase-js
```

### Étape 4 : Configurer le client

Créer `src/lib/supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Adapter pour le stockage sécurisé
const ExpoSecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Étape 5 : Créer les hooks de données

Créer `src/hooks/useWallets.js` :

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useWallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWallets();
    
    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('wallets')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets' },
        (payload) => {
          fetchWallets();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalBalance = (currency = 'XOF') => {
    return wallets
      .filter(w => w.currency === currency)
      .reduce((sum, w) => sum + parseFloat(w.balance), 0);
  };

  return { wallets, loading, error, refetch: fetchWallets, getTotalBalance };
}
```

### Étape 6 : Variables d'environnement

Créer `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔥 Option 2 : Firebase

Firebase est déjà partiellement configuré dans le projet.

### Configuration existante

Le fichier `src/firebase.js` est déjà présent. Il faut :

1. Créer un projet Firebase Console
2. Activer Authentication (Email/Phone)
3. Créer une base Firestore
4. Configurer les règles de sécurité

### Structure Firestore recommandée

```
users/
  {userId}/
    profile: { firstName, lastName, phone, country }
    wallets/
      {walletId}: { type, provider, balance, currency }
    transactions/
      {transactionId}: { type, amount, status, ... }
    
groupSavings/
  {groupId}/
    info: { name, target, current, members }
    contributions/
      {contributionId}: { userId, amount, date }

lockedSavings/
  {savingsId}/
    { userId, amount, unlockDate, status }
```

---

## 🛠️ Option 3 : Backend personnalisé

Pour un contrôle total, créer une API Node.js/Express :

### Structure recommandée

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── wallet.controller.js
│   │   ├── transaction.controller.js
│   │   └── savings.controller.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── api.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   └── services/
│       ├── payment.service.js
│       └── notification.service.js
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## 💳 Intégrations de paiement

### Mobile Money - Afrique de l'Ouest

#### 1. Orange Money API

```javascript
// services/orangeMoney.js
const ORANGE_API_URL = 'https://api.orange.com/orange-money-webpay';

export async function initiatePayment(amount, phoneNumber, reference) {
  const response = await fetch(`${ORANGE_API_URL}/v1/webpayment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ORANGE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      merchant_key: process.env.ORANGE_MERCHANT_KEY,
      currency: 'XOF',
      order_id: reference,
      amount: amount,
      return_url: 'owo://payment/callback',
      cancel_url: 'owo://payment/cancel',
      notif_url: 'https://api.owo-app.com/webhooks/orange',
    }),
  });
  
  return response.json();
}
```

#### 2. MTN MoMo API

```javascript
// services/mtnMomo.js
const MTN_API_URL = 'https://sandbox.momodeveloper.mtn.com';

export async function createPaymentRequest(amount, phoneNumber, reference) {
  // 1. Obtenir le token
  const tokenResponse = await fetch(`${MTN_API_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${API_USER}:${API_KEY}`).toString('base64')}`,
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
    },
  });
  
  const { access_token } = await tokenResponse.json();
  
  // 2. Créer la demande de paiement
  const paymentResponse = await fetch(`${MTN_API_URL}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'X-Reference-Id': reference,
      'X-Target-Environment': 'sandbox', // 'production' en prod
      'Ocp-Apim-Subscription-Key': process.env.MTN_SUBSCRIPTION_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'XOF',
      externalId: reference,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber,
      },
      payerMessage: 'Paiement owo!',
      payeeNote: 'Merci pour votre paiement',
    }),
  });
  
  return paymentResponse.status === 202;
}
```

#### 3. Wave API (Sénégal, Côte d'Ivoire)

```javascript
// services/wave.js
const WAVE_API_URL = 'https://api.wave.com/v1';

export async function sendMoney(amount, recipientPhone) {
  const response = await fetch(`${WAVE_API_URL}/checkout/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      currency: 'XOF',
      error_url: 'owo://payment/error',
      success_url: 'owo://payment/success',
    }),
  });
  
  return response.json();
}
```

### Carte virtuelle - Intégration Stripe Issuing

```javascript
// services/stripeCard.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createVirtualCard(userId, cardholderName) {
  // 1. Créer le cardholder
  const cardholder = await stripe.issuing.cardholders.create({
    type: 'individual',
    name: cardholderName,
    email: `${userId}@owo-app.com`,
    billing: {
      address: {
        line1: 'Abidjan',
        city: 'Abidjan',
        country: 'CI',
        postal_code: '00000',
      },
    },
  });
  
  // 2. Créer la carte virtuelle
  const card = await stripe.issuing.cards.create({
    cardholder: cardholder.id,
    currency: 'eur',
    type: 'virtual',
    spending_controls: {
      spending_limits: [
        { amount: 100000, interval: 'daily' },
        { amount: 500000, interval: 'monthly' },
      ],
    },
  });
  
  return card;
}

export async function getCardDetails(cardId) {
  const card = await stripe.issuing.cards.retrieve(cardId, {
    expand: ['number', 'cvc'],
  });
  
  return {
    number: card.number,
    expMonth: card.exp_month,
    expYear: card.exp_year,
    cvc: card.cvc,
  };
}
```

---

## 🔒 Sécurité

### 1. Authentification

```javascript
// Utiliser l'authentification par téléphone (OTP)
import { supabase } from '@/lib/supabase';

export async function sendOTP(phone) {
  const { error } = await supabase.auth.signInWithOtp({
    phone: phone,
  });
  return !error;
}

export async function verifyOTP(phone, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phone,
    token: token,
    type: 'sms',
  });
  return { user: data?.user, error };
}
```

### 2. Chiffrement des données sensibles

```javascript
// utils/encryption.js
import * as Crypto from 'expo-crypto';

export async function hashPin(pin) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin + process.env.EXPO_PUBLIC_PIN_SALT
  );
  return hash;
}

export async function verifyPin(pin, hashedPin) {
  const hash = await hashPin(pin);
  return hash === hashedPin;
}
```

### 3. Stockage sécurisé

```javascript
// Toujours utiliser SecureStore pour les données sensibles
import * as SecureStore from 'expo-secure-store';

export async function storeSecurely(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export async function getSecurely(key) {
  return await SecureStore.getItemAsync(key);
}
```

---

## ✅ Checklist de déploiement

### Backend
- [ ] Créer le projet Supabase/Firebase
- [ ] Configurer les tables/collections
- [ ] Définir les règles de sécurité (RLS/Rules)
- [ ] Créer les Edge Functions/Cloud Functions
- [ ] Configurer les webhooks pour les paiements
- [ ] Mettre en place le monitoring (Sentry, LogRocket)

### Mobile
- [ ] Remplacer les données mockées par les appels API
- [ ] Implémenter l'authentification réelle
- [ ] Configurer les notifications push
- [ ] Tester sur iOS et Android
- [ ] Configurer EAS Build pour la production
- [ ] Soumettre aux stores (App Store, Play Store)

### Paiements
- [ ] Obtenir les clés API des opérateurs Mobile Money
- [ ] Configurer Stripe pour les cartes virtuelles
- [ ] Implémenter les webhooks de confirmation
- [ ] Tester les flux de paiement en sandbox
- [ ] Passer en production avec les opérateurs

### Légal & Conformité
- [ ] Politique de confidentialité
- [ ] Conditions d'utilisation
- [ ] Conformité RGPD
- [ ] Licence d'établissement de paiement (si applicable)
- [ ] KYC/AML pour les gros montants

---

## 📞 Contacts API Mobile Money

| Opérateur | Pays | Documentation |
|-----------|------|---------------|
| MTN MoMo | CI, BF, BJ | https://momodeveloper.mtn.com |
| Orange Money | CI, SN, ML | https://developer.orange.com |
| Wave | SN, CI | https://developers.wave.com |
| Moov Money | CI, BJ, TG | Contact direct |

---

## 🎯 Prochaines étapes recommandées

1. **Semaine 1** : Configurer Supabase et créer les tables
2. **Semaine 2** : Implémenter l'authentification par téléphone
3. **Semaine 3** : Connecter les wallets et transactions
4. **Semaine 4** : Intégrer un premier opérateur Mobile Money (MTN ou Orange)
5. **Semaine 5** : Tests et corrections
6. **Semaine 6** : Déploiement beta

---

*Document créé le 1er décembre 2024 pour le projet owo!*
