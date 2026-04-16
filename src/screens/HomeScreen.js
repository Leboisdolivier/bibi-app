import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  const todayCalories = 1850;
  const targetCalories = 2200;
  const progress = (todayCalories / targetCalories) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour ! 👋</Text>
      <Text style={styles.subtitle}>Votre résumé du jour</Text>

      {/* Carte calories */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calories aujourd'hui</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={styles.caloriesText}>
          {todayCalories} / {targetCalories} kcal
        </Text>
      </View>

      {/* Accès rapide */}
      <Text style={styles.sectionTitle}>Accès rapide</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chrono')}
        >
          <Text style={styles.actionEmoji}>⏱️</Text>
          <Text style={styles.actionText}>Chronomètre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Nutrition')}
        >
          <Text style={styles.actionEmoji}>📸</Text>
          <Text style={styles.actionText}>Photo repas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Entraînement')}
        >
          <Text style={styles.actionEmoji}>💪</Text>
          <Text style={styles.actionText}>Entraînement</Text>
        </TouchableOpacity>
      </View>

      {/* Objectifs macros (aperçu) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macros du jour</Text>
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>142g</Text>
            <Text style={styles.macroLabel}>Protéines</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>185g</Text>
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>62g</Text>
            <Text style={styles.macroLabel}>Lipides</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#8892b0', marginBottom: 24 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#e94560', marginBottom: 12 },
  progressContainer: {
    height: 8,
    backgroundColor: '#16213e',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  caloriesText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  actionEmoji: { fontSize: 28, marginBottom: 8 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: 'bold', color: '#e94560' },
  macroLabel: { fontSize: 12, color: '#8892b0', marginTop: 4 },
});
