import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Image, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déj', emoji: '🌅' },
  { id: 'lunch',     label: 'Déjeuner',  emoji: '☀️' },
  { id: 'dinner',    label: 'Dîner',     emoji: '🌙' },
  { id: 'snack',     label: 'Collation', emoji: '🍎' },
];

const CONFIDENCE_LABEL = {
  high:   { label: 'Confiance élevée',   color: '#4ecdc4' },
  medium: { label: 'Confiance moyenne',  color: '#f7b731' },
  low:    { label: 'Confiance faible',   color: '#e94560' },
};

export default function FoodVisionModal({ result, visible, onAdd, onRetry, onClose }) {
  const [mealType, setMealType] = useState('lunch');

  if (!result) return null;

  const conf = CONFIDENCE_LABEL[result.confidence] ?? CONFIDENCE_LABEL.medium;
  const { total } = result;

  const handleAdd = () => {
    onAdd({
      id: Date.now().toString(),
      name: result.name,
      brand: 'Analyse IA',
      image: result.imageUri,
      mealType,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      grams: null,
      calories: total.calories,
      protein:  total.protein,
      carbs:    total.carbs,
      fat:      total.fat,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analyse IA du repas</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Photo + badge confiance */}
          <View style={styles.photoWrapper}>
            {result.imageUri && (
              <Image source={{ uri: result.imageUri }} style={styles.photo} />
            )}
            <View style={[styles.confidenceBadge, { borderColor: conf.color }]}>
              <Text style={[styles.confidenceText, { color: conf.color }]}>🤖 {conf.label}</Text>
            </View>
          </View>

          {/* Nom du plat */}
          <Text style={styles.mealName}>{result.name}</Text>

          {/* Totaux */}
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Estimation totale</Text>
            <View style={styles.totalsRow}>
              <MacroBox label="Calories" value={total.calories} unit="kcal" color="#e94560" big />
              <MacroBox label="Protéines" value={total.protein} unit="g" color="#4ecdc4" />
              <MacroBox label="Glucides"  value={total.carbs}   unit="g" color="#f7b731" />
              <MacroBox label="Lipides"   value={total.fat}     unit="g" color="#a29bfe" />
            </View>
          </View>

          {/* Détail par aliment */}
          {result.items?.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Détail des aliments identifiés</Text>
              {result.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemCals}>{item.calories} kcal</Text>
                </View>
              ))}
            </>
          )}

          {/* Note IA */}
          {result.note && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>ℹ️  {result.note}</Text>
            </View>
          )}

          {/* Type de repas */}
          <Text style={styles.sectionLabel}>Ajouter à quel repas ?</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.mealChip, mealType === m.id && styles.mealChipActive]}
                onPress={() => setMealType(m.id)}
              >
                <Text style={styles.mealEmoji}>{m.emoji}</Text>
                <Text style={[styles.mealLabel, mealType === m.id && styles.mealLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Boutons */}
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Ajouter au journal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>📷 Réessayer avec une autre photo</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MacroBox({ label, value, unit, color, big }) {
  return (
    <View style={styles.macroBox}>
      <Text style={[styles.macroValue, { color, fontSize: big ? 28 : 18 }]}>{value}</Text>
      <Text style={[styles.macroUnit, { color }]}>{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },

  photoWrapper: { position: 'relative', marginBottom: 16 },
  photo: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#16213e' },
  confidenceBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(15,15,35,0.85)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  confidenceText: { fontSize: 12, fontWeight: '700' },

  mealName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },

  totalsCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#16213e' },
  totalsTitle: { color: '#8892b0', fontSize: 13, marginBottom: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBox: { alignItems: 'center' },
  macroValue: { fontWeight: '800' },
  macroUnit: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  macroLabel: { color: '#8892b0', fontSize: 10, marginTop: 4 },

  sectionLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#16213e' },
  itemInfo: {},
  itemName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  itemQty: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  itemCals: { color: '#e94560', fontWeight: '700', fontSize: 14 },

  noteBox: { backgroundColor: '#16213e', borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 4 },
  noteText: { color: '#8892b0', fontSize: 12, lineHeight: 18 },

  mealTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  mealChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#16213e' },
  mealChipActive: { borderColor: '#e94560' },
  mealEmoji: { fontSize: 18 },
  mealLabel: { color: '#8892b0', fontSize: 11, marginTop: 4 },
  mealLabelActive: { color: '#e94560' },

  addBtn: { backgroundColor: '#e94560', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  retryBtn: { padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#16213e' },
  retryBtnText: { color: '#8892b0', fontSize: 14 },
});
