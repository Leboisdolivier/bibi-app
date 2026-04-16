import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Mode démo : pas de Firebase configuré → accès direct à l'app
      setUser({ uid: 'demo', email: 'demo@bibis.app' });
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    if (!auth) throw new Error('Configurez Firebase (GUIDE_FIREBASE.md)');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password) => {
    if (!auth) throw new Error('Configurez Firebase (GUIDE_FIREBASE.md)');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (!auth) return; // Mode démo : pas de déconnexion
    return firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
