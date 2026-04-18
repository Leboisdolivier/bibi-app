import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductModal from '../components/ProductModal';
import FoodVisionModal from '../components/FoodVisionModal';
import { searchProducts } from '../services/openFoodFacts';
import { analyzeFood } from '../services/foodVision';
import { loadTodayEntries, saveTodayEntries } from '../services/storage';

// Objectifs par défaut (remplacés par ceux du profil si renseigné)
const DEFAULT_GOALS = { calories: 2200, protein: 150, carbs: 250, fat: 75 };

const MEAL_LABELS = {
  breakfast: { label: 'Petit-déjeuner', emoji: '🌅' },
  lunch:     { label: 'Déjeuner',       emoji: '☀️' },
  dinner:    { label: 'Dîner',          emoji: '🌙' },
  snack:     { label: 'Collation',      emoji: '🍎' },
};
const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];

export default function NutritionScreen() {
  const { profile } = useProfile();
  const DAILY_GOALS = profile?.calorieTarget
    ? { calories: profile.calorieTarget, ...profile.macros }
    : DEFAULT_GOALS;
  const [entries, setEntries] = useState([]);

  // Charge les entrées du jour au démarrage
  useEffect(() => {
    loadTodayEntries().then(saved => { if (saved.length) setEntries(saved); });
  }, []);

  // Sauvegarde à chaque modification
  const updateEntries = useCallback((newEntries) => {
    setEntries(newEntries);
    saveTodayEntries(newEntries);
  }, []);

  const [showScanner, setShowScanner]       = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [scannedProduct, setScannedProduct] = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [searchLoading, setSearchLoading]   = useState(false);

  // --- Vision IA ---
  const [visionResult, setVisionResult]   = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  const handlePhotoAnalysis = useCallback(async (source = 'camera') => {
    let imageUri = null;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;
      imageUri = result.assets[0].uri;
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Autorisez l\'accès aux photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;
      imageUri = result.assets[0].uri;
    }

    setVisionLoading(true);
    try {
      const analysis = await analyzeFood(imageUri);
      setVisionResult({ ...analysis, imageUri });
    } catch (e) {
      if (e.message === 'CLE_MANQUANTE') {
        Alert.alert(
          'Clé API manquante',
          'Ajoutez votre clé Anthropic dans le fichier .env\n(EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...)'
        );
      } else {
        Alert.alert('Erreur', `Impossible d'analyser la photo.\n${e.message}`);
      }
    } finally {
      setVisionLoading(false);
    }
  }, []);

  // --- Totaux ---
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // --- Scanner ---
  const handleProductFound = useCallback((product) => {
    setShowScanner(false);
    setScannedProduct(product);
  }, []);

  // --- Recherche manuelle ---
  const handleSearch = useCallback(async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const results = await searchProducts(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // --- Ajout d'un aliment ---
  const handleAddEntry = useCallback((entry) => {
    setEntries(prev => {
      const next = [...prev, entry];
      saveTodayEntries(next);
      return next;
    });
    setScannedProduct(null);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // --- Suppression ---
  const handleDelete = useCallback((id) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      saveTodayEntries(next);
      return next;
    });
  }, []);

  // --- Groupes par repas ---
  const grouped = MEAL_ORDER.reduce((acc, type) => {
    const items = entries.filter(e => e.mealType === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* En-tête du jour */}
        <Text style={styles.pageTitle}>Journal alimentaire</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* Carte résumé + progression */}
        <SummaryCard totals={totals} goals={DAILY_GOALS} />

        {/* Boutons d'ajout */}
        <View style={styles.addRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowScanner(true)}>
            <Text style={styles.addBtnIcon}>📦</Text>
            <Text style={styles.addBtnText}>Code-barres</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, styles.addBtnAI]}
            onPress={() => handlePhotoAnalysis('camera')}
            disabled={visionLoading}
          >
            {visionLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addBtnIcon}>🤖</Text>
            )}
            <Text style={styles.addBtnText}>Photo IA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowSearch(true)}>
            <Text style={styles.addBtnIcon}>🔍</Text>
            <Text style={styles.addBtnText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        {/* Chargement IA */}
        {visionLoading && (
          <View style={styles.visionLoadingBanner}>
            <ActivityIndicator color="#E8291C" size="small" />
            <Text style={styles.visionLoadingText}>  Analyse du repas en cours…</Text>
          </View>
        )}

        {/* Journal par repas */}
        {MEAL_ORDER.filter(t => grouped[t]).map(type => (
          <MealGroup
            key={type}
            type={type}
            entries={grouped[type]}
            onDelete={handleDelete}
          />
        ))}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>Aucun aliment ajouté aujourd'hui</Text>
            <Text style={styles.emptyHint}>Scannez un code-barres ou recherchez un aliment</Text>
          </View>
        )}

      </ScrollView>

      {/* Scanner plein écran */}
      {showScanner && (
        <View style={StyleSheet.absoluteFill}>
          <BarcodeScanner
            onProductFound={handleProductFound}
            onClose={() => setShowScanner(false)}
          />
        </View>
      )}

      {/* Modal confirmation produit scanné */}
      {scannedProduct && (
        <ProductModal
          product={scannedProduct}
          visible={!!scannedProduct}
          onAdd={handleAddEntry}
          onClose={() => setScannedProduct(null)}
        />
      )}

      {/* Modal résultat analyse IA */}
      {visionResult && (
        <FoodVisionModal
          result={visionResult}
          visible={!!visionResult}
          onAdd={(entry) => {
            handleAddEntry(entry);
            setVisionResult(null);
          }}
          onRetry={() => { setVisionResult(null); handlePhotoAnalysis('camera'); }}
          onClose={() => setVisionResult(null)}
        />
      )}

      {/* Modal recherche manuelle */}
      <SearchModal
        visible={showSearch}
        query={searchQuery}
        results={searchResults}
        loading={searchLoading}
        onChangeQuery={handleSearch}
        onSelectProduct={(p) => { setScannedProduct(p); setShowSearch(false); }}
        onClose={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
      />
    </View>
  );
}

// ─── Carte résumé ────────────────────────────────────────────────────────────
function SummaryCard({ totals, goals }) {
  const caloriesPct = Math.min((totals.calories / goals.calories) * 100, 100);
  const remaining = Math.max(goals.calories - totals.calories, 0);

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryCalLabel}>Calories du jour</Text>
          <Text style={styles.summaryCalValue}>{totals.calories}</Text>
          <Text style={styles.summaryCalGoal}>/ {goals.calories} kcal</Text>
        </View>
        <View style={styles.summaryRemainingBox}>
          <Text style={styles.summaryRemainingValue}>{remaining}</Text>
          <Text style={styles.summaryRemainingLabel}>restantes</Text>
        </View>
      </View>

      {/* Barre calories */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${caloriesPct}%`, backgroundColor: caloriesPct > 95 ? '#F59E0B' : '#E8291C' }]} />
      </View>

      {/* Barres macros */}
      <View style={styles.macrosRow}>
        <MacroBar label="Protéines" value={totals.protein} goal={goals.protein} color="#4ecdc4" unit="g" />
        <MacroBar label="Glucides"  value={totals.carbs}   goal={goals.carbs}   color="#f7b731" unit="g" />
        <MacroBar label="Lipides"   value={totals.fat}     goal={goals.fat}     color="#a29bfe" unit="g" />
      </View>
    </View>
  );
}

function MacroBar({ label, value, goal, color, unit }) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <View style={styles.macroBarItem}>
      <View style={styles.macroBarBg}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.macroBarValue, { color }]}>{value}{unit}</Text>
      <Text style={styles.macroBarLabel}>{label}</Text>
    </View>
  );
}

// ─── Groupe de repas ─────────────────────────────────────────────────────────
function MealGroup({ type, entries, onDelete }) {
  const meta = MEAL_LABELS[type];
  const groupCals = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <View style={styles.mealGroup}>
      <View style={styles.mealGroupHeader}>
        <Text style={styles.mealGroupEmoji}>{meta.emoji}</Text>
        <Text style={styles.mealGroupLabel}>{meta.label}</Text>
        <Text style={styles.mealGroupCals}>{groupCals} kcal</Text>
      </View>
      {entries.map(entry => (
        <EntryRow key={entry.id} entry={entry} onDelete={onDelete} />
      ))}
    </View>
  );
}

function EntryRow({ entry, onDelete }) {
  return (
    <View style={styles.entryRow}>
      {entry.image ? (
        <Image source={{ uri: entry.image }} style={styles.entryImage} />
      ) : (
        <View style={styles.entryImagePlaceholder}>
          <Text style={{ fontSize: 20 }}>🍽️</Text>
        </View>
      )}
      <View style={styles.entryInfo}>
        <Text style={styles.entryName} numberOfLines={1}>{entry.name}</Text>
        {entry.brand ? <Text style={styles.entryBrand}>{entry.brand}</Text> : null}
        <Text style={styles.entryMacros}>
          {entry.calories} kcal · {entry.grams}g · P:{entry.protein}g G:{entry.carbs}g L:{entry.fat}g
        </Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Modal recherche ─────────────────────────────────────────────────────────
function SearchModal({ visible, query, results, loading, onChangeQuery, onSelectProduct, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.searchContainer}>
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.searchTitle}>Rechercher un aliment</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchInputRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ex : yaourt nature, riz basmati…"
            placeholderTextColor="#7A5540"
            value={query}
            onChangeText={onChangeQuery}
            autoFocus
            returnKeyType="search"
          />
          {loading && <ActivityIndicator color="#E8291C" size="small" />}
        </View>

        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultRow} onPress={() => onSelectProduct(item)}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.searchResultImg} />
              ) : (
                <View style={styles.searchResultImgPlaceholder}>
                  <Text style={{ fontSize: 20 }}>🛒</Text>
                </View>
              )}
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName} numberOfLines={1}>{item.name}</Text>
                {item.brand ? <Text style={styles.searchResultBrand}>{item.brand}</Text> : null}
                <Text style={styles.searchResultMacros}>
                  {item.per100.calories} kcal · P:{item.per100.protein}g G:{item.per100.carbs}g L:{item.per100.fat}g (100g)
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length >= 2 && !loading ? (
              <Text style={styles.searchEmpty}>Aucun résultat pour « {query} »</Text>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#100800' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  pageTitle: { fontSize: 26, fontWeight: '900', color: '#FFF5E8', letterSpacing: -0.5 },
  date: { fontSize: 14, color: '#C4956A', marginBottom: 20, marginTop: 2, textTransform: 'capitalize' },

  // Summary
  summaryCard: { backgroundColor: '#1E1008', borderRadius: 18, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: '#3D2015' },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  summaryCalLabel: { color: '#C4956A', fontSize: 13 },
  summaryCalValue: { fontSize: 38, fontWeight: '800', color: '#E8291C', lineHeight: 44 },
  summaryCalGoal: { color: '#C4956A', fontSize: 13 },
  summaryRemainingBox: { alignItems: 'center', backgroundColor: '#2C1810', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  summaryRemainingValue: { fontSize: 22, fontWeight: '700', color: '#FFF5E8' },
  summaryRemainingLabel: { color: '#C4956A', fontSize: 11, marginTop: 2 },
  progressBg: { height: 8, backgroundColor: '#2C1810', borderRadius: 4, overflow: 'hidden', marginBottom: 18 },
  progressFill: { height: '100%', borderRadius: 4 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  macroBarItem: { flex: 1, alignItems: 'center' },
  macroBarBg: { width: '100%', height: 6, backgroundColor: '#2C1810', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
  macroBarFill: { height: '100%', borderRadius: 3 },
  macroBarValue: { fontSize: 14, fontWeight: '700' },
  macroBarLabel: { color: '#C4956A', fontSize: 11, marginTop: 2 },

  // Boutons ajout
  addRow: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  addBtn: { flex: 1, backgroundColor: '#1E1008', borderRadius: 14, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: '#3D2015' },
  addBtnAI: { borderColor: '#E8291C', backgroundColor: '#2C1810' },
  addBtnIcon: { fontSize: 26, marginBottom: 6 },
  addBtnText: { color: '#FFF5E8', fontWeight: '600', fontSize: 13 },
  visionLoadingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C1810', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E8291C' },
  visionLoadingText: { color: '#E8291C', fontSize: 14 },

  // Groupes repas
  mealGroup: { marginBottom: 18 },
  mealGroupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  mealGroupEmoji: { fontSize: 18, marginRight: 8 },
  mealGroupLabel: { flex: 1, color: '#FFF5E8', fontWeight: '700', fontSize: 16 },
  mealGroupCals: { color: '#E8291C', fontWeight: '600', fontSize: 14 },

  // Entrée
  entryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1008', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#3D2015' },
  entryImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#2C1810' },
  entryImagePlaceholder: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  entryInfo: { flex: 1, marginLeft: 10 },
  entryName: { color: '#FFF5E8', fontWeight: '600', fontSize: 14 },
  entryBrand: { color: '#C4956A', fontSize: 11, marginTop: 1 },
  entryMacros: { color: '#E8291C', fontSize: 11, marginTop: 3 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#C4956A', fontSize: 16 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyText: { color: '#FFF5E8', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: '#C4956A', fontSize: 13, marginTop: 8, textAlign: 'center' },

  // Search modal
  searchContainer: { flex: 1, backgroundColor: '#100800', padding: 20 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#FFF5E8', fontSize: 16, fontWeight: '700' },
  searchTitle: { fontSize: 17, fontWeight: '700', color: '#FFF5E8' },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1008', borderRadius: 12, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1, borderColor: '#3D2015' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FFF5E8', fontSize: 16, paddingVertical: 14 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3D2015' },
  searchResultImg: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#2C1810' },
  searchResultImgPlaceholder: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#2C1810', alignItems: 'center', justifyContent: 'center' },
  searchResultInfo: { flex: 1, marginLeft: 12 },
  searchResultName: { color: '#FFF5E8', fontWeight: '600', fontSize: 14 },
  searchResultBrand: { color: '#E8291C', fontSize: 12, marginTop: 2 },
  searchResultMacros: { color: '#C4956A', fontSize: 11, marginTop: 3 },
  searchEmpty: { color: '#C4956A', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
