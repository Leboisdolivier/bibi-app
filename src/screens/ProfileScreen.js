import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>
      {user?.email && (
        <Text style={styles.email}>{user.email}</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Objectifs nutritionnels</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Calories cible</Text>
          <Text style={styles.value}>2200 kcal/jour</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Programme</Text>
          <Text style={styles.value}>Prise de masse</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Modifier les objectifs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macros cibles</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Protéines</Text>
          <Text style={styles.value}>150g</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Glucides</Text>
          <Text style={styles.value}>250g</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Lipides</Text>
          <Text style={styles.value}>75g</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Âge</Text>
          <Text style={styles.value}>—</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Poids</Text>
          <Text style={styles.value}>— kg</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Taille</Text>
          <Text style={styles.value}>— cm</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        💡 Consultez GUIDE_FIREBASE.md pour configurer Firebase et activer plusieurs comptes.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#8892b0', marginBottom: 24 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#e94560', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  label: { color: '#8892b0', fontSize: 16 },
  value: { color: '#fff', fontSize: 16, fontWeight: '500' },
  editButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0f3460',
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: { color: '#fff', fontWeight: '600' },
  signOutButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  signOutText: { color: '#e94560', fontWeight: '600' },
  hint: { fontSize: 12, color: '#8892b0', marginTop: 24, lineHeight: 20 },
});
