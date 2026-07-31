const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const webAliases = {
  'expo-secure-store': path.resolve(__dirname, './polyfills/web/secureStore.web.ts'),
  'react-native-webview': path.resolve(__dirname, './polyfills/web/webview.web.tsx'),
  'react-native-safe-area-context': path.resolve(__dirname, './polyfills/web/safeAreaContext.web.jsx'),
  'react-native-web/dist/exports/SafeAreaView': path.resolve(__dirname, './polyfills/web/SafeAreaView.web.jsx'),
  'react-native-web/dist/exports/Alert': path.resolve(__dirname, './polyfills/web/alerts.web.tsx'),
  'react-native-web/dist/exports/RefreshControl': path.resolve(__dirname, './polyfills/web/refreshControl.web.tsx'),
  'expo-location': path.resolve(__dirname, './polyfills/web/location.web.ts'),
  './layouts/Tabs': path.resolve(__dirname, './polyfills/web/tabbar.web.jsx'),
  'expo-notifications': path.resolve(__dirname, './polyfills/web/notifications.web.tsx'),
  'expo-contacts': path.resolve(__dirname, './polyfills/web/contacts.web.ts'),
  'react-native-web/dist/exports/ScrollView': path.resolve(__dirname, './polyfills/web/scrollview.web.jsx'),
};

const nativeAliases = {
  './Libraries/Components/TextInput/TextInput': path.resolve(
    __dirname,
    './polyfills/native/texinput.native.jsx',
  ),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@expo-google-fonts/') && moduleName !== '@expo-google-fonts/dev') {
    return context.resolveRequest(context, '@expo-google-fonts/dev', platform);
  }
  if (platform === 'web' && webAliases[moduleName]) {
    const aliasTarget = path.normalize(webAliases[moduleName]);
    const requestingModule = path.normalize(context.originModulePath || '');

    // A web polyfill may import the original implementation it wraps. In that
    // case, resolving the alias again would point the module back to itself and
    // create a require cycle (notably for ScrollView/Reanimated).
    if (requestingModule !== aliasTarget) {
      return context.resolveRequest(context, aliasTarget, platform);
    }
  }
  if (platform !== 'web' && nativeAliases[moduleName]) {
    return context.resolveRequest(context, nativeAliases[moduleName], platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
