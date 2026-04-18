import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { loadTodayEntries } from '../services/storage';

export default function HomeScreen({ navigation }) {
  const { profile } = useProfile();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadTodayEntries().then(saved => setEntries(saved || []));
  }, []);

  // Recalcule à chaque focus (retour sur l'onglet)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTodayEntries().then(saved => setEntries(saved || []));
    });
    return unsubscribe;
  }, [navigation]);

  const todayCalories  = Math.round(entries.reduce((s, e) => s + (e.calories || 0), 0));
  const todayProtein   = Math.round(entries.reduce((s, e) => s + (e.protein  || 0), 0));
  const todayCarbs     = Math.round(entries.reduce((s, e) => s + (e.carbs    || 0), 0));
  const todayFat       = Math.round(entries.reduce((s, e) => s + (e.fat      || 0), 0));

  const targetCalories = profile.calorieTarget || 2000;
  const progress       = Math.min((todayCalories / targetCalories) * 100, 100);

  const remaining = Math.max(targetCalories - todayCalories, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header BIBIS */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroTitle}>BIBIS</Text>
        <Text style={styles.heroSub}>MUSCLE WARRIOR · FOURQUES</Text>
      </View>

      <Text style={styles.greeting}>Bonjour ! 👋</Text>
      <Text style={styles.subtitle}>Votre résumé du jour</Text>

      {/* Carte calories */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calories aujourd'hui</Text>
        <View style={styles.calorieRow}>
          <View>
            <Text style={styles.caloriesBig}>{todayCalories}</Text>
            <Text style={styles.caloriesSub}>sur {targetCalories} kcal</Text>
          </View>
          <View style={styles.remainingBox}>
            <Text style={styles.remainingValue}>{remaining}</Text>
            <Text style={styles.remainingLabel}>restantes</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, {
            width: `${progress}%`,
            backgroundColor: progress > 95 ? '#F59E0B' : '#E8291C',
          }]} />
        </View>
      </View>

      {/* Accès rapide */}
      <Text style={styles.sectionTitle}>Accès rapide</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chrono')}>
          <Text style={styles.actionEmoji}>⏱️</Text>
          <Text style={styles.actionText}>Chrono</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Nutrition')}>
          <Text style={styles.actionEmoji}>📸</Text>
          <Text style={styles.actionText}>Photo repas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Entraînement')}>
          <Text style={styles.actionEmoji}>💪</Text>
          <Text style={styles.actionText}>Séance</Text>
        </TouchableOpacity>
      </View>

      {/* Macros du jour */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macros du jour</Text>
        <View style={styles.macrosRow}>
          <MacroItem value={todayProtein} label="Protéines" target={profile.macros?.protein} color="#4ECDC4" unit="g" />
          <MacroItem value={todayCarbs}   label="Glucides"  target={profile.macros?.carbs}   color="#F59E0B" unit="g" />
          <MacroItem value={todayFat}     label="Lipides"   target={profile.macros?.fat}      color="#A78BFA" unit="g" />
        </View>
      </View>

    </ScrollView>
  );
}

function MacroItem({ value, label, target, color, unit }) {
  return (
    <View style={styles.macroItem}>
      <Text style={[styles.macroValue, { color }]}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
      {target ? <Text style={styles.macroTarget}>/ {target}{unit}</Text> : null}
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800' },
  content: { paddingBottom: 40 },

  heroBanner: {
    backgroundColor: '#1E1008',
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomWidth: 2, borderBottomColor: '#E8291C',
    alignItems: 'center', marginBottom: 24,
  },
  heroTitle: { fontSize: 52, fontWeight: '900', color: '#E8291C', letterSpacing: 8, lineHeight: 56 },
  heroSub: { fontSize: 11, fontWeight: '700', color: '#C4956A', letterSpacing: 4, marginTop: 4 },

  greeting: { fontSize: 28, fontWeight: 'bold', color: '#FFF5E8', marginBottom: 4, paddingHorizontal: 20 },
  subtitle: { fontSize: 16, color: '#C4956A', marginBottom: 24, paddingHorizontal: 20 },

  card: {
    backgroundColor: '#1E1008', borderRadius: 16, padding: 20,
    marginBottom: 16, marginHorizontal: 20, borderWidth: 1, borderColor: '#3D2015',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#E8291C', marginBottom: 14 },

  calorieRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
  caloriesBig: { fontSize: 40, fontWeight: '900', color: '#FFF5E8', lineHeight: 44 },
  caloriesSub: { color: '#C4956A', fontSize: 13, marginTop: 2 },
  remainingBox: { alignItems: 'center', backgroundColor: '#2C1810', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  remainingValue: { fontSize: 22, fontWeight: '700', color: '#FFF5E8' },
  remainingLabel: { color: '#C4956A', fontSize: 11, marginTop: 2 },

  progressContainer: { height: 8, backgroundColor: '#2C1810', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF5E8', marginBottom: 14, marginTop: 4, paddingHorizontal: 20 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 20 },
  actionButton: {
    flex: 1, backgroundColor: '#1E1008', borderRadius: 12, padding: 16,
    marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#3D2015',
  },
  actionEmoji: { fontSize: 28, marginBottom: 8 },
  actionText: { color: '#FFF5E8', fontSize: 12, fontWeight: '500' },

  macrosRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 20, fontWeight: '800' },
  macroUnit: { fontSize: 12, fontWeight: '600' },
  macroTarget: { color: '#7A5540', fontSize: 11, marginTop: 1 },
  macroLabel: { fontSize: 12, color: '#C4956A', marginTop: 4 },
});
