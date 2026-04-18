import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { scaleNutrition } from '../services/openFoodFacts';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Petit-déj', emoji: '🌅' },
  { id: 'lunch',     label: 'Déjeuner',  emoji: '☀️' },
  { id: 'dinner',    label: 'Dîner',     emoji: '🌙' },
  { id: 'snack',     label: 'Collation', emoji: '🍎' },
];

export default function ProductModal({ product, visible, onAdd, onClose }) {
  const [grams, setGrams] = useState(String(product?.serving?.qty ?? 100));
  const [mealType, setMealType] = useState('lunch');

  // Recalcule les macros en temps réel selon la quantité saisie
  const qty = parseFloat(grams) || 0;
  const nutrition = product
    ? scaleNutrition(product.per100, qty / 100)
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const handleAdd = useCallback(() => {
    if (!product || qty <= 0) return;
    onAdd({
      id: Date.now().toString(),
      name: product.name,
      brand: product.brand,
      image: product.image,
      mealType,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      grams: qty,
      ...nutrition,
    });
  }, [product, qty, mealType, nutrition]);

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter au journal</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Produit */}
          <View style={styles.productRow}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.productImage} />
            ) : (
              <View style={styles.productImagePlaceholder}>
                <Text style={{ fontSize: 30 }}>🛒</Text>
              </View>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
              {product.quantity ? <Text style={styles.productQty}>{product.quantity}</Text> : null}
            </View>
          </View>

          {/* Valeurs pour 100g */}
          <Text style={styles.sectionLabel}>Valeurs nutritionnelles pour 100g</Text>
          <View style={styles.per100Row}>
            {[
              { label: 'Kcal',     value: product.per100.calories, color: '#E8291C' },
              { label: 'Prot.',    value: `${product.per100.protein}g`, color: '#4ECDC4' },
              { label: 'Glucides', value: `${product.per100.carbs}g`,   color: '#F59E0B' },
              { label: 'Lipides',  value: `${product.per100.fat}g`,     color: '#A78BFA' },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.per100Item}>
                <Text style={[styles.per100Value, { color }]}>{value}</Text>
                <Text style={styles.per100Label}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Quantité */}
          <Text style={styles.sectionLabel}>Quantité consommée</Text>
          <View style={styles.qtyRow}>
            {[50, 75, 100, 150, 200].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.qtyChip, parseFloat(grams) === g && styles.qtyChipActive]}
                onPress={() => setGrams(String(g))}
              >
                <Text style={[styles.qtyChipText, parseFloat(grams) === g && styles.qtyChipTextActive]}>
                  {g}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={grams}
              onChangeText={setGrams}
              keyboardType="numeric"
              placeholder="Quantité"
              placeholderTextColor="#C4956A"
              selectTextOnFocus
            />
            <Text style={styles.inputUnit}>grammes</Text>
          </View>

          {/* Résumé calculé */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Pour {qty > 0 ? qty : '—'}g</Text>
            <View style={styles.summaryMacros}>
              <View style={styles.summaryMain}>
                <Text style={styles.summaryCalories}>{nutrition.calories}</Text>
                <Text style={styles.summaryKcal}>kcal</Text>
              </View>
              <View style={styles.summaryDetails}>
                <MacroLine label="Protéines" value={nutrition.protein} unit="g" color="#4ECDC4" />
                <MacroLine label="Glucides"  value={nutrition.carbs}   unit="g" color="#F59E0B" />
                <MacroLine label="Lipides"   value={nutrition.fat}     unit="g" color="#A78BFA" />
              </View>
            </View>
          </View>

          {/* Type de repas */}
          <Text style={styles.sectionLabel}>Repas</Text>
          <View style={styles.mealTypeRow}>
            {MEAL_TYPES.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.mealTypeChip, mealType === m.id && styles.mealTypeChipActive]}
                onPress={() => setMealType(m.id)}
              >
                <Text style={styles.mealTypeEmoji}>{m.emoji}</Text>
                <Text style={[styles.mealTypeLabel, mealType === m.id && styles.mealTypeLabelActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bouton ajouter */}
          <TouchableOpacity
            style={[styles.addBtn, qty <= 0 && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={qty <= 0}
          >
            <Text style={styles.addBtnText}>Ajouter au journal</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MacroLine({ label, value, unit, color }) {
  return (
    <View style={styles.macroLine}>
      <Text style={styles.macroLineLabel}>{label}</Text>
      <Text style={[styles.macroLineValue, { color }]}>{value}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800' },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#FFF5E8', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF5E8' },

  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: '#1E1008', borderRadius: 14, padding: 14 },
  productImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#2C1810' },
  productImagePlaceholder: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, marginLeft: 14 },
  productName: { color: '#FFF5E8', fontWeight: '700', fontSize: 15, lineHeight: 20 },
  productBrand: { color: '#E8291C', fontSize: 12, marginTop: 4 },
  productQty: { color: '#C4956A', fontSize: 11, marginTop: 2 },

  sectionLabel: { color: '#C4956A', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 20 },

  per100Row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1E1008', borderRadius: 12, padding: 14 },
  per100Item: { alignItems: 'center' },
  per100Value: { fontSize: 16, fontWeight: '700' },
  per100Label: { color: '#C4956A', fontSize: 11, marginTop: 2 },

  qtyRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  qtyChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1E1008', borderWidth: 1, borderColor: '#3D2015' },
  qtyChipActive: { backgroundColor: '#E8291C', borderColor: '#E8291C' },
  qtyChipText: { color: '#C4956A', fontSize: 14, fontWeight: '600' },
  qtyChipTextActive: { color: '#FFF5E8' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, backgroundColor: '#1E1008', borderRadius: 10, padding: 14, color: '#FFF5E8', fontSize: 18, fontWeight: '600', borderWidth: 1, borderColor: '#3D2015', textAlign: 'center' },
  inputUnit: { color: '#C4956A', fontSize: 16 },

  summaryCard: { backgroundColor: '#1E1008', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#3D2015' },
  summaryTitle: { color: '#C4956A', fontSize: 13, marginBottom: 12 },
  summaryMacros: { flexDirection: 'row', alignItems: 'center' },
  summaryMain: { alignItems: 'center', marginRight: 24 },
  summaryCalories: { fontSize: 40, fontWeight: '800', color: '#E8291C' },
  summaryKcal: { color: '#C4956A', fontSize: 12, marginTop: -4 },
  summaryDetails: { flex: 1, gap: 6 },
  macroLine: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLineLabel: { color: '#C4956A', fontSize: 14 },
  macroLineValue: { fontSize: 14, fontWeight: '600' },

  mealTypeRow: { flexDirection: 'row', gap: 10 },
  mealTypeChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#1E1008', borderWidth: 1, borderColor: '#3D2015' },
  mealTypeChipActive: { borderColor: '#E8291C', backgroundColor: '#1E1008' },
  mealTypeEmoji: { fontSize: 20 },
  mealTypeLabel: { color: '#C4956A', fontSize: 11, marginTop: 4 },
  mealTypeLabelActive: { color: '#E8291C' },

  addBtn: { backgroundColor: '#E8291C', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 28 },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
});
