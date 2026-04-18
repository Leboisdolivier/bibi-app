/**
 * Service de persistance locale — AsyncStorage
 * Sauvegarde profil, journal nutrition, historique séances
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE:   '@bibis:profile',
  NUTRITION: '@bibis:nutrition:', // + date YYYY-MM-DD
  WORKOUTS:  '@bibis:workouts',
};

// ── Profil ────────────────────────────────────────────────────────────────────
export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) { console.error('[storage] saveProfile', e); }
}

// ── Nutrition (par jour) ─────────────────────────────────────────────────────
function todayKey() {
  return KEYS.NUTRITION + new Date().toISOString().slice(0, 10);
}

export async function loadTodayEntries() {
  try {
    const raw = await AsyncStorage.getItem(todayKey());
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveTodayEntries(entries) {
  try {
    await AsyncStorage.setItem(todayKey(), JSON.stringify(entries));
  } catch (e) { console.error('[storage] saveTodayEntries', e); }
}

// ── Séances ──────────────────────────────────────────────────────────────────
export async function loadWorkouts() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.WORKOUTS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveWorkouts(workouts) {
  try {
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (e) { console.error('[storage] saveWorkouts', e); }
}
