import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import {
  ACTIVITY_LEVELS, GOALS,
  calcBMR, calcTDEE, calcCalorieTarget, calcMacros,
  getActivityLabel, getGoalLabel,
} from '../services/metabolism';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, saveProfile } = useProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const set = useCallback((field, val) => setForm(f => ({ ...f, [field]: val })), []);

  const bmr    = calcBMR(form);
  const tdee   = calcTDEE(bmr, form.activity);
  const target = calcCalorieTarget(tdee, form.goal);
  const macros = calcMacros(target, form.goal, form.weight);

  const handleSave = () => {
    if (!form.age || !form.weight || !form.height) {
      Alert.alert('Champs requis', 'Renseignez votre âge, poids et taille.');
      return;
    }
    saveProfile({ ...form, calorieTarget: target, macros });
    setEditing(false);
    Alert.alert('Profil sauvegardé', `Objectif : ${target} kcal/jour`);
  };

  const handleCancel = () => { setForm(profile); setEditing(false); };

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Mon profil</Text>
            {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
          </View>
          {!editing ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>✏️ Modifier</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Infos personnelles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informations personnelles</Text>
          <Text style={styles.fieldLabel}>Sexe</Text>
          <View style={styles.toggleRow}>
            {[{ id: 'm', label: 'Homme' }, { id: 'f', label: 'Femme' }].map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.toggleBtn, form.sex === opt.id && styles.toggleBtnActive]}
                onPress={() => editing && set('sex', opt.id)}
                disabled={!editing}
              >
                <Text style={[styles.toggleBtnText, form.sex === opt.id && styles.toggleBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.fieldsRow}>
            <NumberField label="Âge"    unit="ans" value={form.age}    onChange={v => set('age', v)}    editing={editing} />
            <NumberField label="Poids"  unit="kg"  value={form.weight} onChange={v => set('weight', v)} editing={editing} />
            <NumberField label="Taille" unit="cm"  value={form.height} onChange={v => set('height', v)} editing={editing} />
          </View>
        </View>

        {/* Niveau activité */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Niveau d'activité</Text>
          {ACTIVITY_LEVELS.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[styles.optionRow, form.activity === level.id && styles.optionRowActive]}
              onPress={() => editing && set('activity', level.id)}
              disabled={!editing}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, form.activity === level.id && styles.optionLabelActive]}>
                  {level.label}
                </Text>
                <Text style={styles.optionDesc}>{level.desc}</Text>
              </View>
              {form.activity === level.id && <Text style={styles.optionCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Objectif */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Objectif</Text>
          {GOALS.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.optionRow, form.goal === goal.id && styles.optionRowActive]}
              onPress={() => editing && set('goal', goal.id)}
              disabled={!editing}
            >
              <View style={styles.optionInfo}>
                <Text style={[styles.optionLabel, form.goal === goal.id && styles.optionLabelActive]}>
                  {goal.label}
                </Text>
                <Text style={styles.optionDesc}>{goal.desc}</Text>
              </View>
              {form.goal === goal.id && <Text style={styles.optionCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Résultats métabolisme */}
        {bmr > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Votre métabolisme</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Text style={styles.metaBoxLabel}>Métabolisme de base</Text>
                <Text style={styles.metaBoxValue}>{bmr} kcal</Text>
                <Text style={styles.metaBoxSub}>BMR — au repos</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaBoxLabel}>Dépense journalière</Text>
                <Text style={styles.metaBoxValue}>{tdee} kcal</Text>
                <Text style={styles.metaBoxSub}>TDEE — avec activité</Text>
              </View>
            </View>
            <View style={styles.targetBox}>
              <Text style={styles.targetLabel}>🎯 Objectif calorique journalier</Text>
              <Text style={styles.targetValue}>{target} kcal</Text>
              <Text style={styles.targetSub}>{getGoalLabel(form.goal)} · {getActivityLabel(form.activity)}</Text>
            </View>
            <Text style={styles.macrosTitle}>Macros recommandées</Text>
            <View style={styles.macrosRow}>
              <MacroTarget label="Protéines" value={macros.protein} unit="g" color="#4ecdc4" pct={Math.round(macros.protein * 4 / target * 100)} />
              <MacroTarget label="Glucides"  value={macros.carbs}   unit="g" color="#f7b731" pct={Math.round(macros.carbs   * 4 / target * 100)} />
              <MacroTarget label="Lipides"   value={macros.fat}     unit="g" color="#a29bfe" pct={Math.round(macros.fat     * 9 / target * 100)} />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function NumberField({ label, unit, value, onChange, editing }) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.numberRow}>
        <TextInput
          style={[styles.numberInput, !editing && styles.numberInputDisabled]}
          value={String(value || '')}
          onChangeText={onChange}
          keyboardType="numeric"
          editable={editing}
          placeholder="—"
          placeholderTextColor="#7A5540"
        />
        <Text style={styles.numberUnit}>{unit}</Text>
      </View>
    </View>
  );
}

function MacroTarget({ label, value, unit, color, pct }) {
  return (
    <View style={styles.macroTarget}>
      <Text style={[styles.macroTargetValue, { color }]}>
        {value}<Text style={styles.macroTargetUnit}>{unit}</Text>
      </Text>
      <Text style={styles.macroTargetLabel}>{label}</Text>
      <Text style={styles.macroTargetSub}>{pct}% des cal.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800' },
  content: { padding: 20, paddingBottom: 50 },

  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: '#FFF5E8', letterSpacing: -0.5 },
  email: { fontSize: 13, color: '#C4956A', marginTop: 4 },
  editBtn: { backgroundColor: '#1E1008', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E8291C' },
  editBtnText: { color: '#E8291C', fontWeight: '600', fontSize: 14 },
  editActions: { flexDirection: 'row', gap: 8 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3D2015' },
  cancelBtnText: { color: '#C4956A', fontSize: 13 },
  saveBtn: { backgroundColor: '#E8291C', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#FFF5E8', fontWeight: '700', fontSize: 13 },

  card: { backgroundColor: '#1E1008', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#3D2015' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#E8291C', marginBottom: 16 },

  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2C1810', alignItems: 'center', borderWidth: 1, borderColor: '#3D2015' },
  toggleBtnActive: { borderColor: '#E8291C', backgroundColor: '#2C1810' },
  toggleBtnText: { color: '#C4956A', fontWeight: '600' },
  toggleBtnTextActive: { color: '#E8291C' },

  fieldsRow: { flexDirection: 'row', gap: 10 },
  numberField: { flex: 1 },
  fieldLabel: { color: '#C4956A', fontSize: 12, marginBottom: 6 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  numberInput: { flex: 1, backgroundColor: '#2C1810', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 10, color: '#FFF5E8', fontSize: 16, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: '#3D2015' },
  numberInputDisabled: { opacity: 0.7 },
  numberUnit: { color: '#C4956A', fontSize: 12 },

  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 4, borderWidth: 1, borderColor: 'transparent' },
  optionRowActive: { backgroundColor: '#2C1810', borderColor: '#E8291C' },
  optionInfo: { flex: 1 },
  optionLabel: { color: '#FFF5E8', fontWeight: '600', fontSize: 14 },
  optionLabelActive: { color: '#E8291C' },
  optionDesc: { color: '#C4956A', fontSize: 12, marginTop: 2 },
  optionCheck: { color: '#E8291C', fontSize: 16, fontWeight: '700' },

  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metaBox: { flex: 1, backgroundColor: '#2C1810', borderRadius: 12, padding: 12, alignItems: 'center' },
  metaBoxLabel: { color: '#C4956A', fontSize: 11, textAlign: 'center', marginBottom: 4 },
  metaBoxValue: { color: '#FFF5E8', fontWeight: '800', fontSize: 16 },
  metaBoxSub: { color: '#C4956A', fontSize: 10, marginTop: 2, textAlign: 'center' },

  targetBox: { backgroundColor: '#2C1810', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E8291C' },
  targetLabel: { color: '#C4956A', fontSize: 13, marginBottom: 4 },
  targetValue: { fontSize: 36, fontWeight: '900', color: '#E8291C' },
  targetSub: { color: '#C4956A', fontSize: 12, marginTop: 4, textAlign: 'center' },

  macrosTitle: { color: '#C4956A', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 10 },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroTarget: { alignItems: 'center' },
  macroTargetValue: { fontSize: 22, fontWeight: '800' },
  macroTargetUnit: { fontSize: 13, fontWeight: '600' },
  macroTargetLabel: { color: '#FFF5E8', fontSize: 12, marginTop: 4 },
  macroTargetSub: { color: '#C4956A', fontSize: 10, marginTop: 2 },

  signOutBtn: { marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E8291C' },
  signOutText: { color: '#E8291C', fontWeight: '600' },
});
