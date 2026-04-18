import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

const AuthContext = createContext({});

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser({ uid: 'demo', email: 'demo@bibis.app' });
      setLoading(false);
      return;
    }

    // Récupère le résultat si on revient d'un redirect Google
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user); })
      .catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    if (!auth) throw new Error('Firebase non configuré');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password) => {
    if (!auth) throw new Error('Firebase non configuré');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Popup d'abord (sans rechargement de page), redirect en fallback si popup bloqué
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase non configuré');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const signOut = async () => {
    if (!auth) return;
    return firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}
