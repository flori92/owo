import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] || (process.argv.includes('--mode') ? process.argv[process.argv.indexOf('--mode') + 1] : 'project');
const errors = [];

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const app = readJson('app.json').expo;
const eas = readJson('eas.json');
const pkg = readJson('package.json');

const fail = (message) => errors.push(message);
const exists = (file) => fs.existsSync(path.join(root, file));

for (const file of [
  app.icon,
  app.splash?.image,
  app.android?.adaptiveIcon?.foregroundImage,
  app.android?.googleServicesFile,
  app.ios?.googleServicesFile,
]) {
  if (!file || !exists(file)) fail(`Fichier de configuration ou asset manquant: ${file || '(non défini)'}`);
}

if (!/^[a-zA-Z][\w]*(\.[\w]+)+$/.test(app.android?.package || '')) {
  fail('expo.android.package doit être un identifiant Android valide.');
}
if (!/^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(app.ios?.bundleIdentifier || '')) {
  fail('expo.ios.bundleIdentifier doit être un Bundle ID iOS valide.');
}
if (!app.extra?.eas?.projectId || !app.owner) fail('Le projet EAS et son owner doivent être configurés.');
if (eas.cli?.appVersionSource !== 'remote' || eas.build?.production?.autoIncrement !== true) {
  fail('EAS doit gérer et incrémenter automatiquement les numéros de build de production.');
}
if (eas.build?.production?.distribution !== 'store') fail('Le profil EAS production doit utiliser distribution=store.');

const audioPermissions = new Set([
  ...(app.android?.permissions || []),
]);
if (audioPermissions.has('android.permission.RECORD_AUDIO')) {
  fail("La permission microphone n'est pas justifiée par les fonctionnalités actuelles.");
}

const androidServices = readJson(app.android.googleServicesFile.replace('./', ''));
const androidPackage = androidServices.client?.[0]?.client_info?.android_client_info?.package_name;
if (androidPackage !== app.android.package) {
  fail(`google-services.json cible ${androidPackage}, mais app.json cible ${app.android.package}.`);
}

const plist = fs.readFileSync(path.join(root, app.ios.googleServicesFile), 'utf8');
const plistBundle = plist.match(/<key>BUNDLE_ID<\/key>\s*<string>([^<]+)<\/string>/)?.[1];
if (plistBundle !== app.ios.bundleIdentifier) {
  fail(`GoogleService-Info.plist cible ${plistBundle}, mais app.json cible ${app.ios.bundleIdentifier}.`);
}

for (const script of ['start', 'android', 'ios', 'typecheck', 'release:check', 'build:production', 'submit:production']) {
  if (!pkg.scripts?.[script]) fail(`Script npm manquant: ${script}`);
}

const parseEnv = (contents) => {
  const values = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    values[key] = value;
  }
  return values;
};

const releaseEnv = { ...(eas.build?.production?.env || {}) };
for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  if (exists(file)) Object.assign(releaseEnv, parseEnv(fs.readFileSync(path.join(root, file), 'utf8')));
}
Object.assign(releaseEnv, process.env);

if (mode === 'release') {
  const required = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    'EXPO_PUBLIC_TERMS_URL',
    'EXPO_PUBLIC_SUPPORT_URL',
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
    'EXPO_PUBLIC_SUPPORT_EMAIL',
  ];
  for (const key of required) {
    const value = releaseEnv[key];
    if (!value || /replace_me|example\.com|your-project/i.test(value)) fail(`Variable de release absente ou factice: ${key}`);
  }

  for (const key of [
    'EXPO_PUBLIC_API_URL',
    'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    'EXPO_PUBLIC_TERMS_URL',
    'EXPO_PUBLIC_SUPPORT_URL',
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
  ]) {
    try {
      const url = new URL(releaseEnv[key]);
      if (url.protocol !== 'https:') fail(`${key} doit utiliser HTTPS.`);
    } catch {
      fail(`${key} doit contenir une URL valide.`);
    }
  }

  if (releaseEnv.EXPO_PUBLIC_APP_MODE !== 'production') fail('EXPO_PUBLIC_APP_MODE doit valoir production.');
  if (releaseEnv.EXPO_PUBLIC_AUTH_BYPASS === 'true') fail('EXPO_PUBLIC_AUTH_BYPASS doit rester désactivé en release.');
  if (releaseEnv.EXPO_PUBLIC_ENABLE_DEMO_MIGRATION === 'true') fail('La migration de démo doit rester désactivée en release.');
}

if (errors.length) {
  console.error(`Validation ${mode} échouée:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Validation ${mode} réussie pour ${app.name} ${app.version} (${app.ios.bundleIdentifier} / ${app.android.package}).`);
