import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, FlatList,
} from 'react-native';
import ActiveWorkout from '../components/ActiveWorkout';
import { PROGRAMS, getExercise } from '../services/exerciseDB';
import { loadWorkouts, saveWorkouts } from '../services/storage';

export default function WorkoutScreen() {
  const [history, setHistory]       = useState([]);
  const [activeWorkout, setActive]  = useState(null); // null | { template }

  // Charge l'historique depuis AsyncStorage au démarrage
  useEffect(() => {
    loadWorkouts().then(saved => { if (saved && saved.length) setHistory(saved); });
  }, []);

  const handleStart = useCallback((template = null) => {
    setActive({ template });
  }, []);

  const handleFinish = useCallback((result) => {
    setHistory(prev => {
      const next = [result, ...prev];
      saveWorkouts(next);
      return next;
    });
    setActive(null);
  }, []);

  const handleCancel = useCallback(() => {
    setActive(null);
  }, []);

  // ── Séance en cours ──────────────────────────────────────────
  if (activeWorkout !== null) {
    return (
      <ActiveWorkout
        template={activeWorkout.template}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />
    );
  }

  // ── Dashboard ────────────────────────────────────────────────
  const weekVol = history
    .filter(w => Date.now() - new Date(w.date) < 7 * 86400000)
    .reduce((a, w) => a + workoutVolume(w), 0);

  const weekSessions = history.filter(w => Date.now() - new Date(w.date) < 7 * 86400000).length;
  const totalSets    = history.reduce((a, w) => a + w.exercises.reduce((b, e) => b + e.sets.length, 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Entraînements</Text>

      {/* Bouton séance libre */}
      <TouchableOpacity style={styles.startBtn} onPress={() => handleStart(null)}>
        <Text style={styles.startBtnIcon}>🏋️</Text>
        <View>
          <Text style={styles.startBtnTitle}>Démarrer une séance</Text>
          <Text style={styles.startBtnSub}>Séance libre · ajoutez vos exercices</Text>
        </View>
        <Text style={styles.startArrow}>›</Text>
      </TouchableOpacity>

      {/* Statistiques semaine */}
      <View style={styles.statsRow}>
        <StatCard label="Séances / semaine" value={weekSessions} icon="📅" />
        <StatCard label="Volume total (kg)" value={weekVol > 0 ? Math.round(weekVol).toLocaleString('fr') : '—'} icon="⚖️" />
        <StatCard label="Séries au total" value={totalSets} icon="🔢" />
      </View>

      {/* Templates programmes */}
      <Text style={styles.sectionTitle}>Programmes rapides</Text>
      <FlatList
        data={PROGRAMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.programList}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.programCard} onPress={() => handleStart(item)}>
            <Text style={styles.programEmoji}>{item.emoji}</Text>
            <Text style={styles.programName}>{item.name}</Text>
            <Text style={styles.programDesc}>{item.description}</Text>
            <Text style={styles.programCount}>{item.exercises.length} exercices</Text>
          </TouchableOpacity>
        )}
      />

      {/* Historique */}
      <Text style={styles.sectionTitle}>Historique</Text>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyText}>Pas encore de séance</Text>
          <Text style={styles.emptyHint}>Lance ta première séance !</Text>
        </View>
      ) : (
        history.map(w => <HistoryCard key={w.id} workout={w} />)
      )}
    </ScrollView>
  );
}

// ─── Carte historique ─────────────────────────────────────────────────────────
function HistoryCard({ workout }) {
  const [expanded, setExpanded] = useState(false);
  const vol = workoutVolume(workout);
  const sets = workout.exercises.reduce((a, e) => a + e.sets.length, 0);

  return (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.85}
    >
      <View style={styles.historyHeader}>
        <View style={styles.historyLeft}>
          <Text style={styles.historyName}>{workout.name}</Text>
          <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
        </View>
        <View style={styles.historyRight}>
          <Text style={styles.historyDuration}>{formatTime(workout.duration)}</Text>
          <Text style={styles.historyExpand}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </View>

      <View style={styles.historyMeta}>
        <MetaChip label={`${workout.exercises.length} exercices`} />
        <MetaChip label={`${sets} séries`} />
        {vol > 0 && <MetaChip label={`${Math.round(vol).toLocaleString('fr')} kg`} color="#4ECDC4" />}
      </View>

      {expanded && (
        <View style={styles.historyDetail}>
          {workout.exercises.map((ex, i) => {
            const bestSet = [...ex.sets].sort((a, b) => (parseFloat(b.weight) || 0) - (parseFloat(a.weight) || 0))[0];
            return (
              <View key={i} style={styles.historyExRow}>
                <Text style={styles.historyExName}>{ex.name}</Text>
                <Text style={styles.historyExSets}>
                  {ex.sets.length} × {bestSet?.reps ?? '?'} reps
                  {bestSet?.weight ? ` @ ${bestSet.weight} kg` : ''}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MetaChip({ label, color = '#C4956A' }) {
  return <Text style={[styles.metaChip, { color }]}>{label}</Text>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function workoutVolume(w) {
  return w.exercises.reduce((a, ex) =>
    a + ex.sets.reduce((b, s) =>
      b + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);
}

function formatTime(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m}min${String(sec).padStart(2, '0')}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Hier';
  if (diff < 7)  return `Il y a ${diff} jours`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800' },
  content: { padding: 20, paddingBottom: 40 },

  pageTitle: { fontSize: 26, fontWeight: '900', color: '#FFF5E8', marginBottom: 18, letterSpacing: -0.5 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#E8291C', borderRadius: 12, padding: 18, marginBottom: 20,
  },
  startBtnIcon: { fontSize: 28 },
  startBtnTitle: { color: '#FFF5E8', fontWeight: '800', fontSize: 16 },
  startBtnSub: { color: 'rgba(255,245,232,0.7)', fontSize: 12, marginTop: 2 },
  startArrow: { color: '#FFF5E8', fontSize: 24, marginLeft: 'auto' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1E1008', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3D2015' },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { color: '#E8291C', fontWeight: '800', fontSize: 15 },
  statLabel: { color: '#C4956A', fontSize: 10, textAlign: 'center', marginTop: 3 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF5E8', marginBottom: 12 },

  programList: { paddingBottom: 4, gap: 12 },
  programCard: {
    backgroundColor: '#1E1008', borderRadius: 14, padding: 16, width: 140,
    borderWidth: 1, borderColor: '#3D2015', marginRight: 12,
  },
  programEmoji: { fontSize: 28, marginBottom: 8 },
  programName: { color: '#FFF5E8', fontWeight: '800', fontSize: 16 },
  programDesc: { color: '#C4956A', fontSize: 11, marginTop: 4, lineHeight: 16 },
  programCount: { color: '#E8291C', fontSize: 11, marginTop: 8, fontWeight: '600' },

  historyCard: {
    backgroundColor: '#1E1008', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#3D2015',
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  historyLeft: {},
  historyName: { color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
  historyDate: { color: '#C4956A', fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyDuration: { color: '#E8291C', fontWeight: '600', fontSize: 14 },
  historyExpand: { color: '#C4956A', fontSize: 12 },
  historyMeta: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  metaChip: { fontSize: 12, fontWeight: '500' },
  historyDetail: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#3D2015', paddingTop: 12, gap: 8 },
  historyExRow: { flexDirection: 'row', justifyContent: 'space-between' },
  historyExName: { color: '#FFF5E8', fontSize: 13 },
  historyExSets: { color: '#C4956A', fontSize: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyText: { color: '#FFF5E8', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: '#C4956A', fontSize: 13, marginTop: 6 },
});
