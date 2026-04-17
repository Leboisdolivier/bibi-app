/**
 * Calculs métabolisme — Formule Mifflin-St Jeor (la plus précise)
 */

export const ACTIVITY_LEVELS = [
  { id: 'sedentary',   label: 'Sédentaire',          desc: 'Peu ou pas d\'exercice',        factor: 1.2  },
  { id: 'light',       label: 'Légèrement actif',     desc: '1-3 jours de sport / semaine',  factor: 1.375 },
  { id: 'moderate',    label: 'Modérément actif',     desc: '3-5 jours de sport / semaine',  factor: 1.55 },
  { id: 'active',      label: 'Très actif',           desc: '6-7 jours de sport / semaine',  factor: 1.725 },
  { id: 'very_active', label: 'Extrêmement actif',    desc: 'Sport intense + travail physique', factor: 1.9 },
];

export const GOALS = [
  { id: 'lose_fast',   label: 'Perte rapide',     desc: '-1 kg/semaine',     modifier: -500 },
  { id: 'lose_slow',   label: 'Perte progressive',desc: '-0.5 kg/semaine',   modifier: -250 },
  { id: 'maintain',    label: 'Maintien',          desc: 'Garder le poids',   modifier: 0    },
  { id: 'gain_slow',   label: 'Prise lean',        desc: '+0.25 kg/semaine',  modifier: +250 },
  { id: 'gain_fast',   label: 'Prise de masse',    desc: '+0.5 kg/semaine',   modifier: +500 },
];

/**
 * Calcule le BMR (métabolisme de base) via Mifflin-St Jeor
 * @param {object} profile - { sex: 'm'|'f', weight (kg), height (cm), age (ans) }
 */
export function calcBMR({ sex, weight, height, age }) {
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age)    || 0;
  if (!w || !h || !a) return 0;

  if (sex === 'm') {
    return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  } else {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
}

/**
 * Calcule le TDEE (dépense calorique journalière totale)
 */
export function calcTDEE(bmr, activityId) {
  const level = ACTIVITY_LEVELS.find(a => a.id === activityId);
  const factor = level?.factor ?? 1.2;
  return Math.round(bmr * factor);
}

/**
 * Calcule l'objectif calorique selon le but
 */
export function calcCalorieTarget(tdee, goalId) {
  const goal = GOALS.find(g => g.id === goalId);
  return Math.max(1200, tdee + (goal?.modifier ?? 0));
}

/**
 * Calcule les macros recommandées selon l'objectif
 * Retourne { protein, carbs, fat } en grammes
 */
export function calcMacros(calories, goalId, weight) {
  const w = parseFloat(weight) || 70;

  // Protéines selon objectif
  const proteinPerKg = ['gain_slow', 'gain_fast'].includes(goalId) ? 2.2
    : ['lose_fast', 'lose_slow'].includes(goalId) ? 2.0
    : 1.8;

  const protein = Math.round(w * proteinPerKg);
  const proteinCals = protein * 4;

  // Lipides : 25% des calories
  const fatCals = Math.round(calories * 0.25);
  const fat = Math.round(fatCals / 9);

  // Glucides : le reste
  const carbsCals = calories - proteinCals - fatCals;
  const carbs = Math.round(Math.max(carbsCals, 0) / 4);

  return { protein, carbs, fat };
}

/** Retourne le label d'un niveau d'activité */
export function getActivityLabel(id) {
  return ACTIVITY_LEVELS.find(a => a.id === id)?.label ?? '';
}

/** Retourne le label d'un objectif */
export function getGoalLabel(id) {
  return GOALS.find(g => g.id === id)?.label ?? '';
}
