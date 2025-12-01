#!/usr/bin/env node

// Script pour créer la base de données Appwrite via API REST
// Usage: node scripts/setup-with-api.js

const https = require('https');

// Configuration
const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '6915ff850039f714e80a';
const API_KEY = 'standard_7069172c1dfad4fbd791edc2814f129887169e0858f95bd395a66adb9b032c7103a107e9b46b4b22ed7019a5db9892ea520ef7e0ab15f50d23890c84b02652ece06ec91e6ff13ef7ab50b9f4e835a35487a14169ff2316204df2abdf46cb436b490b36f4d3b860b9e1c4b5f7b0d6b6e730b90b32622b75b0fd4625349faf2543';

const DATABASE_ID = 'owo_database';

// Helper pour faire des requêtes API
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fra.cloud.appwrite.io',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            console.error(`Erreur ${res.statusCode}:`, json);
            reject(json);
          }
        } catch (e) {
          reject(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Collections à créer
const collections = [
  {
    collectionId: 'profiles',
    name: 'Profiles',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'email', type: 'string', size: 255 },
      { key: 'phone', type: 'string', size: 20 },
      { key: 'firstName', type: 'string', size: 100 },
      { key: 'lastName', type: 'string', size: 100 },
      { key: 'avatarUrl', type: 'string', size: 500 },
      { key: 'country', type: 'string', size: 5, default: 'CI' },
      { key: 'currency', type: 'string', size: 5, default: 'XOF' },
      { key: 'createdAt', type: 'datetime' },
      { key: 'updatedAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'wallets',
    name: 'Wallets',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'provider', type: 'string', size: 50, required: true },
      { key: 'balance', type: 'float', default: 0 },
      { key: 'currency', type: 'string', size: 5, default: 'XOF' },
      { key: 'accountNumber', type: 'string', size: 50 },
      { key: 'isPrimary', type: 'boolean', default: false },
      { key: 'status', type: 'string', size: 20, default: 'active' },
      { key: 'createdAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'transactions',
    name: 'Transactions',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'walletId', type: 'string', size: 36 },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'amount', type: 'float', required: true },
      { key: 'currency', type: 'string', size: 5, default: 'XOF' },
      { key: 'fee', type: 'float', default: 0 },
      { key: 'status', type: 'string', size: 20, default: 'pending' },
      { key: 'recipientPhone', type: 'string', size: 20 },
      { key: 'recipientName', type: 'string', size: 100 },
      { key: 'description', type: 'string', size: 500 },
      { key: 'reference', type: 'string', size: 50 },
      { key: 'createdAt', type: 'datetime' },
      { key: 'completedAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'group_savings',
    name: 'Group Savings',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'code', type: 'string', size: 20, required: true },
      { key: 'name', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500 },
      { key: 'targetAmount', type: 'float' },
      { key: 'currentAmount', type: 'float', default: 0 },
      { key: 'currency', type: 'string', size: 5, default: 'XOF' },
      { key: 'creatorId', type: 'string', size: 36, required: true },
      { key: 'endDate', type: 'datetime' },
      { key: 'isPublic', type: 'boolean', default: false },
      { key: 'status', type: 'string', size: 20, default: 'active' },
      { key: 'createdAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'group_members',
    name: 'Group Members',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'groupId', type: 'string', size: 36, required: true },
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'role', type: 'string', size: 20, default: 'member' },
      { key: 'contributedAmount', type: 'float', default: 0 },
      { key: 'joinedAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'locked_savings',
    name: 'Locked Savings',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 500 },
      { key: 'amount', type: 'float', required: true },
      { key: 'targetAmount', type: 'float' },
      { key: 'currency', type: 'string', size: 5, default: 'XOF' },
      { key: 'unlockDate', type: 'datetime', required: true },
      { key: 'emergencyPin', type: 'string', size: 100 },
      { key: 'status', type: 'string', size: 20, default: 'locked' },
      { key: 'createdAt', type: 'datetime' },
      { key: 'unlockedAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'virtual_cards',
    name: 'Virtual Cards',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'cardNumber', type: 'string', size: 100, required: true },
      { key: 'expiryDate', type: 'string', size: 10, required: true },
      { key: 'cvv', type: 'string', size: 100, required: true },
      { key: 'balance', type: 'float', default: 0 },
      { key: 'dailyLimit', type: 'float', default: 1000 },
      { key: 'monthlyLimit', type: 'float', default: 5000 },
      { key: 'status', type: 'string', size: 20, default: 'active' },
      { key: 'createdAt', type: 'datetime' },
    ],
  },
  {
    collectionId: 'notifications',
    name: 'Notifications',
    permissions: ['read("users")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'message', type: 'string', size: 500 },
      { key: 'read', type: 'boolean', default: false },
      { key: 'createdAt', type: 'datetime' },
      { key: 'readAt', type: 'datetime' },
    ],
  },
];

// Fonction principale
async function setupDatabase() {
  console.log('🚀 Configuration de la base de données Appwrite pour owo!');
  console.log('==================================================\n');

  try {
    // Créer la base de données
    console.log('📦 Création de la base de données...');
    try {
      await makeRequest('POST', `/databases`, {
        databaseId: DATABASE_ID,
        name: 'owo! Database',
      });
      console.log('✅ Base de données créée');
    } catch (error) {
      if (error.type === 'database_already_exists') {
        console.log('✅ Base de données existe déjà');
      } else {
        throw error;
      }
    }

    // Créer les collections
    console.log('\n📋 Création des collections...');
    for (const collection of collections) {
      console.log(`  → ${collection.name}`);
      
      try {
        // Créer la collection
        await makeRequest('POST', `/databases/${DATABASE_ID}/collections`, {
          collectionId: collection.collectionId,
          name: collection.name,
          permissions: collection.permissions,
          documentSecurity: true,
        });
        
        // Créer les attributs
        for (const attr of collection.attributes) {
          try {
            const attrData = {
              key: attr.key,
              type: attr.type,
              size: attr.size,
              required: attr.required || false,
            };
            
            if (attr.default !== undefined) {
              attrData.default = attr.default;
            }
            
            await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${collection.collectionId}/attributes/${attr.type}`, attrData);
          } catch (e) {
            // Ignorer si l'attribut existe déjà
            if (!e.type || !e.type.includes('already_exists')) {
              console.warn(`    ⚠️  Erreur création attribut ${attr.key}:`, e.message || e);
            }
          }
        }
        
        console.log(`    ✅ Collection ${collection.name} créée`);
      } catch (error) {
        if (error.type === 'collection_already_exists') {
          console.log(`    ✅ Collection ${collection.name} existe déjà`);
        } else {
          console.warn(`    ⚠️  Erreur collection ${collection.name}:`, error.message || error);
        }
      }
    }

    // Créer les index
    console.log('\n🔍 Création des index...');
    const indexes = [
      { collection: 'wallets', key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { collection: 'transactions', key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { collection: 'transactions', key: 'reference_idx', type: 'unique', attributes: ['reference'] },
      { collection: 'group_savings', key: 'code_idx', type: 'unique', attributes: ['code'] },
      { collection: 'group_members', key: 'groupId_idx', type: 'key', attributes: ['groupId'] },
      { collection: 'group_members', key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { collection: 'locked_savings', key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { collection: 'virtual_cards', key: 'userId_idx', type: 'key', attributes: ['userId'] },
      { collection: 'notifications', key: 'userId_idx', type: 'key', attributes: ['userId'] },
    ];

    for (const index of indexes) {
      try {
        await makeRequest('POST', `/databases/${DATABASE_ID}/collections/${index.collection}/indexes`, {
          key: index.key,
          type: index.type,
          attributes: index.attributes,
        });
        console.log(`    ✅ Index ${index.key} créé`);
      } catch (error) {
        if (error.type === 'index_already_exists') {
          console.log(`    ✅ Index ${index.key} existe déjà`);
        } else {
          console.warn(`    ⚠️  Erreur index ${index.key}:`, error.message || error);
        }
      }
    }

    console.log('\n✅ Configuration terminée!');
    console.log('\n📊 Résumé des collections créées:');
    collections.forEach(c => {
      console.log(`   - ${c.collectionId.padEnd(15)} : ${c.name}`);
    });
    console.log(`\n🔗 Console Appwrite: https://cloud.appwrite.io/console/project-${PROJECT_ID}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Lancer le script
setupDatabase();
