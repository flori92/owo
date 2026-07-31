import '@expo/metro-runtime';
import './__create/consoleToParent';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

import './__create/reset.css';
import CreateApp from './App';

renderRootComponent(CreateApp);
