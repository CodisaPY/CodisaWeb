import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------


export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;  // Para el backend Node.js
  springServerUrl: string;  // Para el backend Spring Boot
  assetsDir: string;
  auth: {
    method: 'jwt' | 'amplify' | 'firebase' | 'supabase' | 'auth0' | 'keycloak';
    skip: boolean;
    redirectPath: string;
  };
  mapboxApiKey: string;
  firebase: {
    appId: string;
    apiKey: string;
    projectId: string;
    authDomain: string;
    storageBucket: string;
    measurementId: string;
    messagingSenderId: string;
  };
  amplify: { userPoolId: string; userPoolWebClientId: string; region: string };
  auth0: { clientId: string; domain: string; callbackUrl: string };
  supabase: { url: string; key: string };
};

// ----------------------------------------------------------------------
const isProduction = import.meta.env.MODE === 'production';

export const CONFIG: ConfigValue = {
  appName: 'Linker Codisa',
  appVersion: packageJson.version,

  serverUrl: import.meta.env.VITE_SERVER_URL || 'https://linker-app-backend.braveglacier-674d7e00.eastus2.azurecontainerapps.io', // URL base del servidor GraphQL
  springServerUrl: import.meta.env.VITE_SPRING_SERVER_URL || 'http://localhost:9003', // URL base del servidor Spring Boot

  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',

  /**
   * Auth
   * @method jwt | amplify | firebase | supabase | auth0
   */
  auth: {
    method: 'keycloak', // ✅ Ahora usa Keycloak
    skip: false,
    redirectPath: paths.dashboard.root,
  },

  /**
   * Mapbox
   */
  mapboxApiKey: import.meta.env.VITE_MAPBOX_API_KEY ?? '',
  /**
   * Firebase
   */
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: import.meta.env.VITE_FIREBASE_APPID ?? '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
  },
  /**
   * Amplify
   */
  amplify: {
    userPoolId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_ID ?? '',
    userPoolWebClientId: import.meta.env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID ?? '',
    region: import.meta.env.VITE_AWS_AMPLIFY_REGION ?? '',
  },
  /**
   * Auth0
   */
  auth0: {
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID ?? '',
    domain: import.meta.env.VITE_AUTH0_DOMAIN ?? '',
    callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL ?? '',
  },
  /**
   * Supabase
   */
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL ?? '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  },
};
