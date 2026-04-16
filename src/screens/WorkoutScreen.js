import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function WorkoutScreen() {
  const workouts = [
    { id: '1', name: 'Full body', date: 'Aujourd\'hui', exercises: 8, duration: '45 min' },
    { id: '2', name: 'Push', date: 'Hier', exercises: 6, duration: '40 min' },
    { id: '3', name: 'Pull', date: 'Il y a 2 jours', exercises: 6, duration: '38 min' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Entraînements</Text>
      <Text style={styles.subtitle}>Suivez vos séances et votre progression</Text>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Nouvelle séance</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Séances récentes</Text>
      {workouts.map((w) => (
        <View key={w.id} style={styles.workoutCard}>
          <View style={styles.workoutHeader}>
            <Text style={styles.workoutName}>{w.name}</Text>
            <Text style={styles.workoutDate}>{w.date}</Text>
          </View>
          <View style={styles.workoutStats}>
            <Text style={styles.stat}>{w.exercises} exercices</Text>
            <Text style={styles.stat}>{w.duration}</Text>
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progression</Text>
        <Text style={styles.cardText}>
          Les graphiques de progression (charges, volume, performances) seront disponibles dans une prochaine version.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8892b0', marginBottom: 24 },
  addButton: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  workoutCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workoutName: { fontSize: 18, fontWeight: '600', color: '#fff' },
  workoutDate: { fontSize: 12, color: '#8892b0' },
  workoutStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  stat: { fontSize: 14, color: '#e94560' },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#e94560', marginBottom: 8 },
  cardText: { fontSize: 14, color: '#8892b0', lineHeight: 22 },
});
