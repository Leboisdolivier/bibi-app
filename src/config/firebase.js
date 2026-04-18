/**
 * Configuration Firebase
 * 
 * 1. Allez sur https://console.firebase.google.com
 * 2. Créez un projet (voir GUIDE_FIREBASE.md)
 * 3. Paramètres du projet → Vos applications → Ajouter une app Web
 * 4. Copiez les valeurs ci-dessous et remplacez VOTRE_* par vos vraies valeurs
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCc9qUv1yhcqSpJaCwb7LQ0BR5m4Lus6F8",
  authDomain: "bibis-app.firebaseapp.com",
  projectId: "bibis-app",
  storageBucket: "bibis-app.firebasestorage.app",
  messagingSenderId: "850978647378",
  appId: "1:850978647378:web:d96c792ff96745ecbb1e8b"
};

// Vérifier si Firebase est configuré (mode démo si non configuré)
const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('VOTRE');

let app, auth, db, storage;
if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;
