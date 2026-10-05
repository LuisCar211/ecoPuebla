import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configuración pública de la aplicación web. No incluyas cuentas de servicio ni claves privadas aquí.
const firebaseConfig = {
  apiKey: 'AIzaSyDupjT9RmJWaho4MD7sv5-GHDIT5uzXGQQ',
  authDomain: 'ecopuebla-bc93e.firebaseapp.com',
  projectId: 'ecopuebla-bc93e',
  storageBucket: 'ecopuebla-bc93e.firebasestorage.app',
  messagingSenderId: '932494656668',
  appId: '1:932494656668:web:8044de2a08db55fbcd5959',
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // Expo Fast Refresh puede haber inicializado Auth previamente.
    if (error?.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
}
// La base de este proyecto se llama 'default' (sin paréntesis).
// getFirestore(app) apuntaría a la base especial '(default)', que aquí no existe.
const databaseId = process.env.EXPO_PUBLIC_FIRESTORE_DATABASE_ID || 'default';
const db = getFirestore(app, databaseId);
export { auth, db };
