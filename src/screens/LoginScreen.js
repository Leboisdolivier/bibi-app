import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
        Alert.alert('Succès', 'Compte créé ! Vous êtes connecté.');
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
      {/* Logo BIBIS */}
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>BIBIS</Text>
        <Text style={styles.logoSub}>MUSCLE BEACH · VENICE</Text>
      </View>

      <Text style={styles.subtitle}>
        {isSignUp ? 'Créer un compte' : 'Connectez-vous'}
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
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF5E8" />
        ) : (
          <Text style={styles.buttonText}>
            {isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.switch}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.switchText}>
          {isSignUp
            ? 'Déjà un compte ? Se connecter'
            : 'Pas de compte ? S\'inscrire'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        Configurez Firebase (GUIDE_FIREBASE.md) pour activer la connexion.
      </Text>
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
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoText: { fontSize: 52, fontWeight: '900', color: '#E8291C', letterSpacing: -1 },
  logoSub: { fontSize: 11, color: '#C4956A', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },
  subtitle: { fontSize: 16, color: '#C4956A', textAlign: 'center', marginBottom: 24 },
  input: {
    backgroundColor: '#1E1008',
    borderRadius: 12,
    padding: 16,
    color: '#FFF5E8',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3D2015',
  },
  button: {
    backgroundColor: '#E8291C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
  switch: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#E8291C', fontSize: 14 },
  hint: { marginTop: 32, color: '#7A5540', fontSize: 12, textAlign: 'center' },
});
