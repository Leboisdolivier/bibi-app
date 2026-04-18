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
            placeholderTextColor="#C4956A"
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

        {/* Résultats liste (recherche ou filtre muscle) */}
        {list !== null && (
          <FlatList
            key="list"
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
        )}

        {/* Grille groupes musculaires */}
        {list === null && (
          <FlatList
            key="grid"
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
  container: { flex: 1, backgroundColor: '#100800', padding: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#FFF5E8', fontSize: 16, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '700', color: '#FFF5E8' },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1008', borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: '#3D2015' },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF5E8', fontSize: 15, paddingVertical: 13 },
  clearText: { color: '#C4956A', fontSize: 14, padding: 4 },

  muscleChips: { paddingBottom: 12, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1008', borderWidth: 1, borderColor: '#3D2015', marginRight: 8 },
  chipActive: { borderColor: '#E8291C', backgroundColor: '#1E1008' },
  chipEmoji: { fontSize: 14 },
  chipLabel: { color: '#C4956A', fontSize: 13, fontWeight: '500' },
  chipLabelActive: { color: '#E8291C' },

  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#3D2015' },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#FFF5E8', fontSize: 15, fontWeight: '600' },
  exerciseMeta: { color: '#C4956A', fontSize: 12, marginTop: 2 },
  exerciseAdd: { color: '#E8291C', fontSize: 26, fontWeight: '300', paddingHorizontal: 8 },

  empty: { color: '#C4956A', textAlign: 'center', marginTop: 40 },

  grid: { paddingBottom: 40 },
  gridRow: { gap: 12, marginBottom: 12 },
  gridCard: { flex: 1, backgroundColor: '#1E1008', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#3D2015' },
  gridEmoji: { fontSize: 28, marginBottom: 8 },
  gridLabel: { color: '#FFF5E8', fontWeight: '700', fontSize: 14 },
  gridCount: { color: '#C4956A', fontSize: 11, marginTop: 4 },
});
