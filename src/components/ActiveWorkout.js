import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Vibration,
} from 'react-native';
import ExercisePicker from './ExercisePicker';
import { getExercise } from '../services/exerciseDB';

const REST_PRESETS = [30, 60, 90, 120, 180];

export default function ActiveWorkout({ template, onFinish, onCancel }) {
  // ── État séance ──────────────────────────────────────────────
  const [workoutName, setWorkoutName] = useState(template?.name ?? 'Séance libre');
  const [exercises, setExercises]     = useState(() => buildExercises(template));
  const [showPicker, setShowPicker]   = useState(false);

  // ── Chrono séance ────────────────────────────────────────────
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Chrono repos ─────────────────────────────────────────────
  const [restSeconds, setRestSeconds]   = useState(0);
  const [restActive, setRestActive]     = useState(false);
  const [restPreset, setRestPreset]     = useState(90);
  const restRef = useRef(null);

  const startRest = useCallback((secs = restPreset) => {
    clearInterval(restRef.current);
    setRestSeconds(secs);
    setRestActive(true);
    restRef.current = setInterval(() => {
      setRestSeconds(s => {
        if (s <= 1) {
          clearInterval(restRef.current);
          setRestActive(false);
          Vibration.vibrate([0, 300, 100, 300]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [restPreset]);

  const stopRest = useCallback(() => {
    clearInterval(restRef.current);
    setRestActive(false);
    setRestSeconds(0);
  }, []);

  useEffect(() => () => clearInterval(restRef.current), []);

  // ── Actions sur séries ───────────────────────────────────────
  const toggleSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const sets = ex.sets.map((s, si) => {
        if (si !== setIdx) return s;
        const done = !s.done;
        if (done) startRest();
        return { ...s, done };
      });
      return { ...ex, sets };
    }));
  }, [startRest]);

  const updateSet = useCallback((exIdx, setIdx, field, val) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const sets = ex.sets.map((s, si) =>
        si === setIdx ? { ...s, [field]: val } : s
      );
      return { ...ex, sets };
    }));
  }, []);

  const addSet = useCallback((exIdx) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { weight: last?.weight ?? '', reps: last?.reps ?? '10', done: false }] };
    }));
  }, []);

  const removeSet = useCallback((exIdx, setIdx) => {
    setExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      if (ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
    }));
  }, []);

  const removeExercise = useCallback((exIdx) => {
    setExercises(prev => prev.filter((_, i) => i !== exIdx));
  }, []);

  const addExercise = useCallback((exercise) => {
    setExercises(prev => [...prev, {
      id: exercise.id,
      name: exercise.name,
      type: exercise.type,
      sets: [{ weight: '', reps: '10', done: false }],
    }]);
    setShowPicker(false);
  }, []);

  // ── Terminer ─────────────────────────────────────────────────
  const handleFinish = () => {
    const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
    if (completedSets === 0) {
      Alert.alert('Séance vide', 'Validez au moins une série avant de terminer.', [{ text: 'OK' }]);
      return;
    }
    Alert.alert(
      'Terminer la séance ?',
      `${completedSets} série${completedSets > 1 ? 's' : ''} · ${formatTime(elapsed)}`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Terminer', onPress: () => onFinish(buildResult()) },
      ]
    );
  };

  const buildResult = () => ({
    id: Date.now().toString(),
    name: workoutName,
    date: new Date().toISOString(),
    duration: elapsed,
    exercises: exercises.map(ex => ({
      ...ex,
      sets: ex.sets.filter(s => s.done),
    })).filter(ex => ex.sets.length > 0),
  });

  const handleCancel = () => {
    Alert.alert('Abandonner ?', 'La séance ne sera pas sauvegardée.',
      [{ text: 'Continuer', style: 'cancel' }, { text: 'Abandonner', style: 'destructive', onPress: onCancel }]
    );
  };

  const totalDone  = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
  const totalSets  = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const totalVol   = exercises.reduce((a, ex) =>
    a + ex.sets.filter(s => s.done).reduce((b, s) =>
      b + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0);

  return (
    <View style={styles.root}>
      {/* Header séance */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
          <Text style={styles.headerSub}>{totalDone}/{totalSets} séries</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
          <Text style={styles.finishText}>Terminer</Text>
        </TouchableOpacity>
      </View>

      {/* Bannière chrono repos */}
      {restActive && (
        <TouchableOpacity style={styles.restBanner} onPress={stopRest} activeOpacity={0.85}>
          <Text style={styles.restEmoji}>⏳</Text>
          <View>
            <Text style={styles.restTime}>{formatTime(restSeconds)}</Text>
            <Text style={styles.restHint}>Repos · Appuyez pour ignorer</Text>
          </View>
          <View style={styles.restPresetsInline}>
            {REST_PRESETS.map(s => (
              <TouchableOpacity key={s} onPress={(e) => { e.stopPropagation?.(); startRest(s); }} style={styles.restPresetChip}>
                <Text style={styles.restPresetText}>{s}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Nom de la séance */}
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Nom de la séance"
          placeholderTextColor="#8892b0"
        />

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <StatPill label="Volume" value={totalVol > 0 ? `${Math.round(totalVol)} kg` : '—'} />
          <StatPill label="Exercices" value={exercises.length} />
          <StatPill label="Séries ok" value={`${totalDone}/${totalSets}`} />
        </View>

        {/* Exercices */}
        {exercises.map((ex, exIdx) => (
          <ExerciseBlock
            key={`${ex.id}-${exIdx}`}
            exercise={ex}
            exIdx={exIdx}
            onToggleSet={toggleSet}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemove={removeExercise}
          />
        ))}

        {/* Bouton ajouter exercice */}
        <TouchableOpacity style={styles.addExBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.addExText}>+ Ajouter un exercice</Text>
        </TouchableOpacity>

        {/* Réglage temps de repos */}
        <View style={styles.restConfig}>
          <Text style={styles.restConfigLabel}>⏱ Repos automatique</Text>
          <View style={styles.restPresetRow}>
            {REST_PRESETS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.presetChip, restPreset === s && styles.presetChipActive]}
                onPress={() => setRestPreset(s)}
              >
                <Text style={[styles.presetText, restPreset === s && styles.presetTextActive]}>{s}s</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      <ExercisePicker visible={showPicker} onSelect={addExercise} onClose={() => setShowPicker(false)} />
    </View>
  );
}

// ─── Bloc exercice ────────────────────────────────────────────────────────────
function ExerciseBlock({ exercise, exIdx, onToggleSet, onUpdateSet, onAddSet, onRemoveSet, onRemove }) {
  const doneSets = exercise.sets.filter(s => s.done).length;

  return (
    <View style={styles.exBlock}>
      <View style={styles.exHeader}>
        <Text style={styles.exName}>{exercise.name}</Text>
        <View style={styles.exHeaderRight}>
          <Text style={styles.exProgress}>{doneSets}/{exercise.sets.length}</Text>
          <TouchableOpacity onPress={() => onRemove(exIdx)} style={styles.exRemoveBtn}>
            <Text style={styles.exRemoveText}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* En-têtes colonnes */}
      <View style={styles.setHeaderRow}>
        <Text style={[styles.setHeaderCell, { width: 32 }]}>N°</Text>
        <Text style={[styles.setHeaderCell, { flex: 1 }]}>Charge (kg)</Text>
        <Text style={[styles.setHeaderCell, { flex: 1 }]}>Répétitions</Text>
        <Text style={[styles.setHeaderCell, { width: 52 }]}>✓</Text>
      </View>

      {exercise.sets.map((s, si) => (
        <SetRow
          key={si}
          set={s}
          index={si}
          exIdx={exIdx}
          onToggle={onToggleSet}
          onUpdate={onUpdateSet}
          onRemove={onRemoveSet}
          isLast={exercise.sets.length === 1}
        />
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={() => onAddSet(exIdx)}>
        <Text style={styles.addSetText}>+ Série</Text>
      </TouchableOpacity>
    </View>
  );
}

function SetRow({ set, index, exIdx, onToggle, onUpdate, onRemove, isLast }) {
  return (
    <View style={[styles.setRow, set.done && styles.setRowDone]}>
      <Text style={[styles.setNumber, set.done && styles.setNumberDone]}>{index + 1}</Text>
      <TextInput
        style={[styles.setInput, set.done && styles.setInputDone]}
        value={set.weight}
        onChangeText={v => onUpdate(exIdx, index, 'weight', v)}
        placeholder="—"
        placeholderTextColor="#8892b0"
        keyboardType="decimal-pad"
        editable={!set.done}
      />
      <TextInput
        style={[styles.setInput, set.done && styles.setInputDone]}
        value={set.reps}
        onChangeText={v => onUpdate(exIdx, index, 'reps', v)}
        placeholder="10"
        placeholderTextColor="#8892b0"
        keyboardType="number-pad"
        editable={!set.done}
      />
      <TouchableOpacity
        style={[styles.checkBtn, set.done && styles.checkBtnDone]}
        onPress={() => onToggle(exIdx, index)}
      >
        <Text style={[styles.checkBtnText, set.done && styles.checkBtnTextDone]}>
          {set.done ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${pad(m)}:${pad(sec)}`;
}
const pad = n => String(n).padStart(2, '0');

function buildExercises(template) {
  if (!template?.exercises?.length) return [];
  return template.exercises.map(id => {
    const ex = getExercise(id);
    return {
      id: ex?.id ?? id,
      name: ex?.name ?? id,
      type: ex?.type ?? 'strength',
      sets: [
        { weight: '', reps: '10', done: false },
        { weight: '', reps: '10', done: false },
        { weight: '', reps: '10', done: false },
      ],
    };
  });
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f0f23' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#1a1a2e', borderBottomWidth: 1, borderBottomColor: '#16213e' },
  cancelBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#8892b0', fontSize: 16, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  timerText: { fontSize: 22, fontWeight: '800', color: '#e94560', fontVariant: ['tabular-nums'] },
  headerSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  finishBtn: { backgroundColor: '#e94560', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  finishText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Bannière repos
  restBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0f3460', paddingHorizontal: 16, paddingVertical: 12 },
  restEmoji: { fontSize: 22 },
  restTime: { fontSize: 20, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'] },
  restHint: { color: '#8892b0', fontSize: 11, marginTop: 1 },
  restPresetsInline: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  restPresetChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: '#16213e' },
  restPresetText: { color: '#8892b0', fontSize: 11, fontWeight: '600' },

  content: { padding: 16, paddingBottom: 60 },

  workoutNameInput: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 14, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#16213e' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statPill: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#16213e' },
  statValue: { color: '#e94560', fontWeight: '800', fontSize: 16 },
  statLabel: { color: '#8892b0', fontSize: 11, marginTop: 3 },

  // Bloc exercice
  exBlock: { backgroundColor: '#1a1a2e', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#16213e' },
  exHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  exName: { color: '#fff', fontWeight: '700', fontSize: 16, flex: 1 },
  exHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exProgress: { color: '#e94560', fontSize: 13, fontWeight: '600' },
  exRemoveBtn: { padding: 4 },
  exRemoveText: { fontSize: 16 },

  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 2 },
  setHeaderCell: { color: '#8892b0', fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },

  // Ligne série
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 6 },
  setRowDone: { opacity: 0.6 },
  setNumber: { width: 32, color: '#8892b0', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  setNumberDone: { color: '#4ecdc4' },
  setInput: { flex: 1, backgroundColor: '#16213e', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, color: '#fff', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  setInputDone: { backgroundColor: '#0d2a1f' },
  checkBtn: { width: 52, height: 36, borderRadius: 8, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: { backgroundColor: '#4ecdc4' },
  checkBtnText: { color: '#8892b0', fontSize: 18 },
  checkBtnTextDone: { color: '#fff', fontWeight: '700' },

  addSetBtn: { marginTop: 10, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#16213e', alignItems: 'center' },
  addSetText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },

  addExBtn: { backgroundColor: '#1a1a2e', borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#16213e', marginBottom: 20 },
  addExText: { color: '#e94560', fontWeight: '700', fontSize: 15 },

  // Config repos
  restConfig: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#16213e' },
  restConfigLabel: { color: '#8892b0', fontSize: 13, marginBottom: 10 },
  restPresetRow: { flexDirection: 'row', gap: 8 },
  presetChip: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#16213e', alignItems: 'center' },
  presetChipActive: { backgroundColor: '#e94560' },
  presetText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  presetTextActive: { color: '#fff' },
});
