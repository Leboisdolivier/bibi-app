import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  const todayCalories = 1850;
  const targetCalories = 2200;
  const progress = (todayCalories / targetCalories) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header Venice Beach */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>BIBIS</Text>
        <Text style={styles.heroSub}>MUSCLE WARRIOR · FOURQUES</Text>
      </View>

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
  container: { flex: 1, backgroundColor: '#100800' },
  content: { paddingBottom: 40 },

  heroBanner: {
    backgroundColor: '#1E1008',
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E8291C',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: '900',
    color: '#E8291C',
    letterSpacing: 8,
    lineHeight: 56,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C4956A',
    letterSpacing: 4,
    marginTop: 4,
  },

  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFF5E8', marginBottom: 4, paddingHorizontal: 20 },
  subtitle: { fontSize: 16, color: '#C4956A', marginBottom: 24, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#1E1008',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#3D2015',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#E8291C', marginBottom: 12 },
  progressContainer: {
    height: 8,
    backgroundColor: '#2C1810',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E8291C',
    borderRadius: 4,
  },
  caloriesText: { fontSize: 16, color: '#FFF5E8', fontWeight: '500' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF5E8', marginBottom: 16, marginTop: 8, paddingHorizontal: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 20 },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E1008',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2015',
  },
  actionEmoji: { fontSize: 28, marginBottom: 8 },
  actionText: { color: '#FFF5E8', fontSize: 12, fontWeight: '500' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: 'bold', color: '#E8291C' },
  macroLabel: { fontSize: 12, color: '#C4956A', marginTop: 4 },
});
