import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Image, ScrollView, KeyboardAvoidingView, Platform,
  TextInput, Alert,
} from 'react-native';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déj', emoji: '🌅' },
  { id: 'lunch',     label: 'Déjeuner',  emoji: '☀️' },
  { id: 'dinner',    label: 'Dîner',     emoji: '🌙' },
  { id: 'snack',     label: 'Collation', emoji: '🍎' },
];

const CONFIDENCE_LABEL = {
  high:   { label: 'Confiance élevée',  color: '#4ECDC4' },
  medium: { label: 'Confiance moyenne', color: '#F59E0B' },
  low:    { label: 'Confiance faible',  color: '#E8291C' },
};

// Ajouts rapides pour boissons/cafés
const QUICK_ADDS = [
  { id: 'sugar_half',  label: '½ sucre',  calories: 8,  protein: 0, carbs: 2,  fat: 0 },
  { id: 'sugar_1',     label: '1 sucre',  calories: 16, protein: 0, carbs: 4,  fat: 0 },
  { id: 'sugar_2',     label: '2 sucres', calories: 32, protein: 0, carbs: 8,  fat: 0 },
  { id: 'milk_splash', label: 'Trait lait',   calories: 10, protein: 0.5, carbs: 1, fat: 0.4 },
  { id: 'milk_dash',   label: 'Nuage lait',   calories: 20, protein: 1,   carbs: 2, fat: 0.8 },
  { id: 'cream',       label: 'Crème',    calories: 30, protein: 0.3, carbs: 0.5, fat: 3 },
  { id: 'syrup',       label: 'Sirop',    calories: 45, protein: 0,   carbs: 11, fat: 0 },
  { id: 'plant_milk',  label: 'Lait végétal', calories: 15, protein: 0.4, carbs: 1.5, fat: 0.5 },
];

// Détecte si c'est une boisson pour afficher les ajouts rapides
function isBeverage(name = '') {
  const kw = ['café', 'coffee', 'thé', 'tea', 'cappuccino', 'latte', 'expresso',
              'espresso', 'americano', 'boisson', 'jus', 'lait', 'chocolat chaud',
              'matcha', 'drink', 'infusion'];
  const n = name.toLowerCase();
  return kw.some(k => n.includes(k));
}

export default function FoodVisionModal({ result, visible, onAdd, onRetry, onClose }) {
  const [mealType, setMealType] = useState('lunch');
  const [items, setItems]       = useState([]);
  const [mealName, setMealName] = useState('');
  const [quickAdds, setQuickAdds] = useState({}); // id => true/false

  // Initialise depuis le résultat IA
  useEffect(() => {
    if (!result) return;
    setMealName(result.name ?? '');
    setItems(
      (result.items ?? []).map((item, i) => ({
        ...item,
        id: `item_${i}`,
        editing: false,
        calories: item.calories ?? 0,
        protein:  item.protein  ?? 0,
        carbs:    item.carbs    ?? 0,
        fat:      item.fat      ?? 0,
        quantity: item.quantity ?? '',
      }))
    );
    setQuickAdds({});
  }, [result]);

  // ── Calcul totaux ──────────────────────────────────────────────
  const totals = (() => {
    const base = items.reduce(
      (acc, it) => ({
        calories: acc.calories + (parseFloat(it.calories) || 0),
        protein:  acc.protein  + (parseFloat(it.protein)  || 0),
        carbs:    acc.carbs    + (parseFloat(it.carbs)    || 0),
        fat:      acc.fat      + (parseFloat(it.fat)      || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const addExtra = Object.keys(quickAdds)
      .filter(k => quickAdds[k])
      .reduce((acc, k) => {
        const qa = QUICK_ADDS.find(q => q.id === k);
        if (!qa) return acc;
        return {
          calories: acc.calories + qa.calories,
          protein:  acc.protein  + qa.protein,
          carbs:    acc.carbs    + qa.carbs,
          fat:      acc.fat      + qa.fat,
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: Math.round(base.calories + addExtra.calories),
      protein:  Math.round((base.protein  + addExtra.protein)  * 10) / 10,
      carbs:    Math.round((base.carbs    + addExtra.carbs)    * 10) / 10,
      fat:      Math.round((base.fat      + addExtra.fat)      * 10) / 10,
    };
  })();

  // ── Édition d'un item ────────────────────────────────────────
  const updateItem = useCallback((id, field, val) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, [field]: val } : it
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, {
      id: `item_${Date.now()}`,
      name: 'Aliment',
      quantity: '100g',
      calories: 0, protein: 0, carbs: 0, fat: 0,
      editing: true,
    }]);
  }, []);

  const toggleQuickAdd = useCallback((id) => {
    setQuickAdds(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Ajout au journal ────────────────────────────────────────
  const handleAdd = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Aucun aliment', 'Ajoutez au moins un aliment avant de valider.');
      return;
    }
    onAdd({
      id: Date.now().toString(),
      name: mealName || result?.name || 'Repas analysé',
      brand: 'Analyse IA',
      image: result?.imageUri,
      mealType,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      grams: null,
      ...totals,
    });
  }, [mealName, items, mealType, totals]);

  if (!result) return null;

  const conf = CONFIDENCE_LABEL[result.confidence] ?? CONFIDENCE_LABEL.medium;
  const showQuickAdds = items.some(it => isBeverage(it.name)) || isBeverage(mealName);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

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

          {/* Nom du repas éditable */}
          <TextInput
            style={styles.mealNameInput}
            value={mealName}
            onChangeText={setMealName}
            placeholder="Nom du repas"
            placeholderTextColor="#7A5540"
          />

          {/* Totaux recalculés en temps réel */}
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>Total estimé</Text>
            <View style={styles.totalsRow}>
              <MacroBox label="Calories" value={totals.calories} unit="kcal" color="#E8291C" big />
              <MacroBox label="Protéines" value={totals.protein} unit="g" color="#4ECDC4" />
              <MacroBox label="Glucides"  value={totals.carbs}   unit="g" color="#F59E0B" />
              <MacroBox label="Lipides"   value={totals.fat}     unit="g" color="#A78BFA" />
            </View>
          </View>

          {/* Aliments reconnus — éditables */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Aliments reconnus</Text>
            <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
              <Text style={styles.addItemBtnText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}

          {/* Ajouts rapides boissons */}
          {showQuickAdds && (
            <>
              <Text style={styles.sectionLabel}>☕ Ajouts à la boisson</Text>
              <View style={styles.quickAddsGrid}>
                {QUICK_ADDS.map(qa => (
                  <TouchableOpacity
                    key={qa.id}
                    style={[styles.qaChip, quickAdds[qa.id] && styles.qaChipActive]}
                    onPress={() => toggleQuickAdd(qa.id)}
                  >
                    <Text style={[styles.qaLabel, quickAdds[qa.id] && styles.qaLabelActive]}>
                      {qa.label}
                    </Text>
                    <Text style={[styles.qaCalories, quickAdds[qa.id] && styles.qaCaloriesActive]}>
                      +{qa.calories} kcal
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
            <Text style={styles.addBtnText}>✓ Ajouter au journal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryBtnText}>📷 Réessayer avec une autre photo</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Ligne aliment éditable ───────────────────────────────────────────────────
function ItemRow({ item, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.itemCard}>
      {/* Ligne principale */}
      <View style={styles.itemMain}>
        <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.itemToggle}>
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.itemNameInput}
          value={item.name}
          onChangeText={v => onUpdate(item.id, 'name', v)}
          placeholder="Aliment"
          placeholderTextColor="#7A5540"
        />
        <TextInput
          style={styles.itemQtyInput}
          value={item.quantity}
          onChangeText={v => onUpdate(item.id, 'quantity', v)}
          placeholder="qté"
          placeholderTextColor="#7A5540"
        />
        <Text style={styles.itemCals}>{Math.round(parseFloat(item.calories) || 0)} kcal</Text>
        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Macros éditables (accordéon) */}
      {expanded && (
        <View style={styles.itemMacros}>
          {[
            { field: 'calories', label: 'Kcal',   color: '#E8291C' },
            { field: 'protein',  label: 'Prot. g', color: '#4ECDC4' },
            { field: 'carbs',    label: 'Gluc. g', color: '#F59E0B' },
            { field: 'fat',      label: 'Lip. g',  color: '#A78BFA' },
          ].map(({ field, label, color }) => (
            <View key={field} style={styles.macroEditRow}>
              <Text style={[styles.macroEditLabel, { color }]}>{label}</Text>
              <TextInput
                style={styles.macroEditInput}
                value={String(item[field])}
                onChangeText={v => onUpdate(item.id, field, v)}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
            </View>
          ))}
        </View>
      )}
    </View>
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800' },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#FFF5E8', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF5E8' },

  photoWrapper: { position: 'relative', marginBottom: 14 },
  photo: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#2C1810' },
  confidenceBadge: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(16,8,0,0.85)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  confidenceText: { fontSize: 12, fontWeight: '700' },

  mealNameInput: { fontSize: 20, fontWeight: '800', color: '#FFF5E8', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#3D2015' },

  totalsCard: { backgroundColor: '#1E1008', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#3D2015' },
  totalsTitle: { color: '#C4956A', fontSize: 12, marginBottom: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBox: { alignItems: 'center' },
  macroValue: { fontWeight: '800' },
  macroUnit: { fontSize: 11, fontWeight: '600', marginTop: -2 },
  macroLabel: { color: '#C4956A', fontSize: 10, marginTop: 4 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
  sectionLabel: { color: '#C4956A', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  addItemBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E8291C' },
  addItemBtnText: { color: '#E8291C', fontSize: 12, fontWeight: '700' },

  // Item card
  itemCard: { backgroundColor: '#1E1008', borderRadius: 12, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#3D2015' },
  itemMain: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  itemToggle: { width: 24, alignItems: 'center' },
  expandIcon: { color: '#C4956A', fontSize: 10 },
  itemNameInput: { flex: 1, color: '#FFF5E8', fontSize: 14, fontWeight: '600' },
  itemQtyInput: { width: 55, color: '#C4956A', fontSize: 12, textAlign: 'center', backgroundColor: '#2C1810', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4 },
  itemCals: { color: '#E8291C', fontSize: 13, fontWeight: '700', minWidth: 55, textAlign: 'right' },
  removeBtn: { padding: 4 },
  removeBtnText: { color: '#C4956A', fontSize: 14 },

  itemMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: '#3D2015', backgroundColor: '#100800' },
  macroEditRow: { alignItems: 'center', gap: 4, minWidth: 70 },
  macroEditLabel: { fontSize: 11, fontWeight: '600' },
  macroEditInput: { backgroundColor: '#1E1008', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: '#FFF5E8', fontSize: 15, fontWeight: '700', textAlign: 'center', minWidth: 70, borderWidth: 1, borderColor: '#3D2015' },

  // Ajouts rapides
  quickAddsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  qaChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1008', borderWidth: 1, borderColor: '#3D2015', alignItems: 'center' },
  qaChipActive: { borderColor: '#E8291C', backgroundColor: '#2C1810' },
  qaLabel: { color: '#C4956A', fontSize: 13, fontWeight: '600' },
  qaLabelActive: { color: '#E8291C' },
  qaCalories: { color: '#7A5540', fontSize: 10, marginTop: 2 },
  qaCaloriesActive: { color: '#E8291C' },

  noteBox: { backgroundColor: '#2C1810', borderRadius: 10, padding: 12, marginBottom: 16 },
  noteText: { color: '#C4956A', fontSize: 12, lineHeight: 18 },

  mealTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  mealChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#1E1008', borderWidth: 1, borderColor: '#3D2015' },
  mealChipActive: { borderColor: '#E8291C' },
  mealEmoji: { fontSize: 18 },
  mealLabel: { color: '#C4956A', fontSize: 11, marginTop: 4 },
  mealLabelActive: { color: '#E8291C' },

  addBtn: { backgroundColor: '#E8291C', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
  retryBtn: { padding: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3D2015' },
  retryBtnText: { color: '#C4956A', fontSize: 14 },
});
