import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, FlatList, SectionList,
} from 'react-native';
import { MUSCLE_GROUPS, EXERCISES, getExercisesByMuscle, searchExercises } from '../services/exerciseDB';

export default function ExercisePicker({ visible, onSelect, onClose }) {
  const [query, setQuery]             = useState('');
  const [selectedMuscle, setMuscle]   = useState(null);

  const handleSearch = useCallback((t) => {
    setQuery(t);
    if (t.length > 0) setMuscle(null);
  }, []);

  const handleMuscle = useCallback((id) => {
    setMuscle(prev => prev === id ? null : id);
    setQuery('');
  }, []);

  // Liste à afficher
  const list = query.length >= 1
    ? searchExercises(query)
    : selectedMuscle
      ? getExercisesByMuscle(selectedMuscle)
      : null; // null = afficher grille groupes musculaires

  const handleSelect = (exercise) => {
    onSelect(exercise);
    setQuery('');
    setMuscle(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ajouter un exercice</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un exercice…"
            placeholderTextColor="#8892b0"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chips groupes musculaires */}
        {query.length === 0 && (
          <FlatList
            data={MUSCLE_GROUPS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.muscleChips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.chip, selectedMuscle === item.id && styles.chipActive]}
                onPress={() => handleMuscle(item.id)}
              >
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text style={[styles.chipLabel, selectedMuscle === item.id && styles.chipLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Résultats ou grille groupes */}
        {list !== null ? (
          <FlatList
            data={list}
            keyExtractor={e => e.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.exerciseRow} onPress={() => handleSelect(item)}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>{item.equipment}</Text>
                </View>
                <Text style={styles.exerciseAdd}>+</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>Aucun exercice trouvé</Text>
            }
          />
        ) : (
          /* Grille groupes musculaires */
          <FlatList
            data={MUSCLE_GROUPS}
            keyExtractor={g => g.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => {
              const count = EXERCISES.filter(e => e.muscle === item.id).length;
              return (
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => handleMuscle(item.id)}
                >
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                  <Text style={styles.gridCount}>{count} exercices</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23', padding: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', color: '#fff' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: '#16213e' },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 13 },
  clearText: { color: '#8892b0', fontSize: 14, padding: 4 },

  muscleChips: { paddingBottom: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#16213e', marginRight: 8 },
  chipActive: { borderColor: '#e94560', backgroundColor: '#1a1a2e' },
  chipEmoji: { fontSize: 14 },
  chipLabel: { color: '#8892b0', fontSize: 13, fontWeight: '500' },
  chipLabelActive: { color: '#e94560' },

  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  exerciseAdd: { color: '#e94560', fontSize: 26, fontWeight: '300', paddingHorizontal: 8 },

  empty: { color: '#8892b0', textAlign: 'center', marginTop: 40 },

  grid: { paddingBottom: 40 },
  gridRow: { gap: 12, marginBottom: 12 },
  gridCard: { flex: 1, backgroundColor: '#1a1a2e', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#16213e' },
  gridEmoji: { fontSize: 28, marginBottom: 8 },
  gridLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  gridCount: { color: '#8892b0', fontSize: 11, marginTop: 4 },
});
