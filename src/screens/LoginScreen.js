import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      // signInWithRedirect redirige la page — pas besoin de gérer le résultat ici
    } catch (error) {
      Alert.alert('Erreur Google', error.message);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Remplissez tous les champs');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (error) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'Cet email est déjà utilisé'
        : error.code === 'auth/invalid-credential'
        ? 'Email ou mot de passe incorrect'
        : error.message;
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Logo */}
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>BIBIS</Text>
        <Text style={styles.logoSub}>MUSCLE WARRIOR · FOURQUES</Text>
      </View>

      {/* Bouton Google — principal */}
      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleText}>Continuer avec Google</Text>
      </TouchableOpacity>

      {/* Séparateur */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>ou</Text>
        <View style={styles.separatorLine} />
      </View>

      {/* Email/Password — secondaire */}
      {!showEmail ? (
        <TouchableOpacity style={styles.emailToggle} onPress={() => setShowEmail(true)}>
          <Text style={styles.emailToggleText}>Continuer avec un email</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7A5540"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min. 6 caractères)"
            placeholderTextColor="#7A5540"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#FFF5E8" />
              : <Text style={styles.buttonText}>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.switch} onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#100800',
    justifyContent: 'center',
    padding: 24,
  },
  logoBox: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 52, fontWeight: '900', color: '#E8291C', letterSpacing: -1 },
  logoSub: { fontSize: 11, color: '#C4956A', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF5E8', borderRadius: 12, padding: 16, gap: 12,
  },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#E8291C' },
  googleText: { fontSize: 16, fontWeight: '700', color: '#100800' },

  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#3D2015' },
  separatorText: { color: '#7A5540', fontSize: 13 },

  emailToggle: { alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#3D2015' },
  emailToggleText: { color: '#C4956A', fontSize: 15 },

  subtitle: { fontSize: 15, color: '#C4956A', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: '#1E1008',
    borderRadius: 12,
    padding: 16,
    color: '#FFF5E8',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D2015',
    WebkitBoxShadow: '0 0 0 1000px #1E1008 inset',
    WebkitTextFillColor: '#FFF5E8',
  },
  button: {
    backgroundColor: '#E8291C', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
  switch: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#E8291C', fontSize: 14 },
});
