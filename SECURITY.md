# 🔐 Guide de Sécurité des Clés API - Projet OWO

## ⚠️ Règles d'Or de Sécurité

### 1. **NE JAMAIS COMMITTER les clés API**
- Les fichiers `.env.local`, `.env` ne doivent **JAMAIS** être dans Git
- Utiliser toujours `.gitignore` pour exclure ces fichiers
- Vérifier avec `git status` avant chaque commit

### 2. **Utiliser des variables d'environnement**
- Mobile (Expo): `EXPO_PUBLIC_NOM_VARIABLE`
- Web (Vite): `VITE_NOM_VARIABLE`

### 3. **Séparer les environnements**
- Développement: `.env.local`
- Production: Variables configurées dans Firebase Hosting

## 📁 Structure des Fichiers de Configuration

```
owo/
├── .env.example              # Template à copier (SAFE à committer)
├── .gitignore               # Exclut les fichiers .env
├── firebase.json            # Configuration Firebase
├── .firebaserc             # Projet Firebase par défaut
├── apps/
│   ├── mobile/
│   │   └── .env.local      # Clés pour mobile (NE PAS COMMITTER)
│   └── web/
│       └── .env.local      # Clés pour web (NE PAS COMMITTER)
```

## 🔑 Clés API Configurées

### Gemini API
- **Variable**: `EXPO_PUBLIC_GEMINI_API_KEY` / `VITE_GEMINI_API_KEY`
- **Valeur**: `AIzaSyCLlC9Eko6ZBvR0bbYEzZD7ucqzGJshZGE`
- **Projet**: `1042152308482`

### Firebase
- **Project ID**: `owo-631ab`
- **API Key**: `AIzaSyCHL0m44l-XMkJznGE214toOvxdYzN5i6g`
- **Auth Domain**: `owo-631ab.firebaseapp.com`
- **Storage Bucket**: `owo-631ab.firebasestorage.app`
- **Messaging Sender ID**: `647650316598`
- **App ID**: `1:647650316598:web:77c5a5f6c240387a61e397`
- **Measurement ID**: `G-1SJPF2FKSQ`

## 🚀 Utilisation dans le Code

### Mobile (React Native/Expo)
```javascript
const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
```

### Web (React/Vite)
```javascript
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
```

## 🔄 Processus pour un Nouveau Développeur

1. **Cloner le projet**
   ```bash
   git clone <repo-url>
   cd owo
   ```

2. **Copier le template d'environnement**
   ```bash
   cp .env.example apps/mobile/.env.local
   cp .env.example apps/web/.env.local
   ```

3. **Remplir les clés API**
   - Éditer `apps/mobile/.env.local`
   - Éditer `apps/web/.env.local`
   - Utiliser les clés fournies par l'équipe

4. **Installer Firebase CLI** (si nécessaire)
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

## 🛡️ Bonnes Pratiques

### ✅ À FAIRE
- ✅ Utiliser des variables d'environnement
- ✅ Exclure les fichiers `.env*` du versionning
- ✅ Utiliser des clés différentes par environnement
- ✅ Régénérer les clés si elles sont compromises
- ✅ Documenter toute nouvelle clé API

### ❌ À NE PAS FAIRE
- ❌ Hardcoder les clés dans le code source
- ❌ Committer les fichiers `.env.local`
- ❌ Partager les clés sur des canaux non sécurisés
- ❌ Utiliser les mêmes clés en dev et prod
- ❌ Ignorer les alertes de sécurité

## 🔍 Vérification de Sécurité

### Avant de committer:
```bash
# Vérifier qu'aucun fichier .env n'est suivi
git status
# Ne devrait montrer aucun fichier .env.local

# Rechercher d'éventuelles clés hardcodées
grep -r "AIzaSy" --exclude-dir=node_modules .
```

### En production:
- Utiliser les variables d'environnement de Firebase Hosting
- Activer les restrictions d'IP sur les clés API
- Surveiller l'utilisation des clés dans la console Firebase

## 📞 En Cas de Problème

Si une clé API est compromise:
1. **Immédiatement**: Révoquer la clé dans la console Firebase
2. **Générer**: Une nouvelle clé API
3. **Mettre à jour**: Tous les fichiers `.env.local`
4. **Notifier**: L'équipe du changement
5. **Faire tourner**: Les clés régulièrement (maintenance)

## 📚 Documentation Complémentaire

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Dernière mise à jour**: 30 novembre 2025  
**Mainteneur**: Équipe de sécurité OWO
