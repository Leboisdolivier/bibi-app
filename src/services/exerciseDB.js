/**
 * Base de données d'exercices
 * Organisée par groupe musculaire principal
 */

export const MUSCLE_GROUPS = [
  { id: 'chest',     label: 'Pectoraux',      emoji: '💪' },
  { id: 'back',      label: 'Dos',            emoji: '🔙' },
  { id: 'shoulders', label: 'Épaules',        emoji: '🏋️' },
  { id: 'biceps',    label: 'Biceps',         emoji: '💪' },
  { id: 'triceps',   label: 'Triceps',        emoji: '💪' },
  { id: 'legs',      label: 'Jambes',         emoji: '🦵' },
  { id: 'glutes',    label: 'Fessiers',       emoji: '🍑' },
  { id: 'abs',       label: 'Abdos',          emoji: '⚡' },
  { id: 'cardio',    label: 'Cardio',         emoji: '❤️' },
];

export const EXERCISES = [
  // ── Pectoraux ──────────────────────────────────────────────────
  { id: 'bench_press',        name: 'Développé couché',         muscle: 'chest',     equipment: 'Barre',      type: 'strength' },
  { id: 'incline_bench',      name: 'Développé incliné',        muscle: 'chest',     equipment: 'Barre',      type: 'strength' },
  { id: 'decline_bench',      name: 'Développé décliné',        muscle: 'chest',     equipment: 'Barre',      type: 'strength' },
  { id: 'db_bench',           name: 'Développé haltères',       muscle: 'chest',     equipment: 'Haltères',   type: 'strength' },
  { id: 'db_fly',             name: 'Écarté haltères',          muscle: 'chest',     equipment: 'Haltères',   type: 'strength' },
  { id: 'cable_fly',          name: 'Écarté poulie',            muscle: 'chest',     equipment: 'Poulie',     type: 'strength' },
  { id: 'pushup',             name: 'Pompes',                   muscle: 'chest',     equipment: 'Poids corps', type: 'strength' },
  { id: 'dips',               name: 'Dips pectoraux',           muscle: 'chest',     equipment: 'Barre',      type: 'strength' },

  // ── Dos ────────────────────────────────────────────────────────
  { id: 'deadlift',           name: 'Soulevé de terre',         muscle: 'back',      equipment: 'Barre',      type: 'strength' },
  { id: 'pullup',             name: 'Tractions',                muscle: 'back',      equipment: 'Barre',      type: 'strength' },
  { id: 'lat_pulldown',       name: 'Tirage nuque poulie',      muscle: 'back',      equipment: 'Poulie',     type: 'strength' },
  { id: 'seated_row',         name: 'Rowing assis poulie',      muscle: 'back',      equipment: 'Poulie',     type: 'strength' },
  { id: 'barbell_row',        name: 'Rowing barre',             muscle: 'back',      equipment: 'Barre',      type: 'strength' },
  { id: 'db_row',             name: 'Rowing haltère',           muscle: 'back',      equipment: 'Haltères',   type: 'strength' },
  { id: 'tbar_row',           name: 'Rowing T-barre',           muscle: 'back',      equipment: 'Barre',      type: 'strength' },
  { id: 'face_pull',          name: 'Face pull poulie',         muscle: 'back',      equipment: 'Poulie',     type: 'strength' },

  // ── Épaules ────────────────────────────────────────────────────
  { id: 'ohp',                name: 'Développé militaire',      muscle: 'shoulders', equipment: 'Barre',      type: 'strength' },
  { id: 'db_ohp',             name: 'Développé haltères',       muscle: 'shoulders', equipment: 'Haltères',   type: 'strength' },
  { id: 'lateral_raise',      name: 'Élévations latérales',     muscle: 'shoulders', equipment: 'Haltères',   type: 'strength' },
  { id: 'front_raise',        name: 'Élévations frontales',     muscle: 'shoulders', equipment: 'Haltères',   type: 'strength' },
  { id: 'arnold_press',       name: 'Arnold press',             muscle: 'shoulders', equipment: 'Haltères',   type: 'strength' },
  { id: 'rear_delt_fly',      name: 'Oiseau arrière',           muscle: 'shoulders', equipment: 'Haltères',   type: 'strength' },
  { id: 'upright_row',        name: 'Tirage menton',            muscle: 'shoulders', equipment: 'Barre',      type: 'strength' },

  // ── Biceps ─────────────────────────────────────────────────────
  { id: 'barbell_curl',       name: 'Curl barre',               muscle: 'biceps',    equipment: 'Barre',      type: 'strength' },
  { id: 'db_curl',            name: 'Curl haltères',            muscle: 'biceps',    equipment: 'Haltères',   type: 'strength' },
  { id: 'hammer_curl',        name: 'Curl marteau',             muscle: 'biceps',    equipment: 'Haltères',   type: 'strength' },
  { id: 'incline_curl',       name: 'Curl incliné',             muscle: 'biceps',    equipment: 'Haltères',   type: 'strength' },
  { id: 'cable_curl',         name: 'Curl poulie basse',        muscle: 'biceps',    equipment: 'Poulie',     type: 'strength' },
  { id: 'concentration_curl', name: 'Curl concentration',       muscle: 'biceps',    equipment: 'Haltères',   type: 'strength' },

  // ── Triceps ────────────────────────────────────────────────────
  { id: 'skull_crusher',      name: 'Skull crusher',            muscle: 'triceps',   equipment: 'Barre',      type: 'strength' },
  { id: 'tricep_pushdown',    name: 'Pushdown poulie',          muscle: 'triceps',   equipment: 'Poulie',     type: 'strength' },
  { id: 'overhead_ext',       name: 'Extension nuque',          muscle: 'triceps',   equipment: 'Haltères',   type: 'strength' },
  { id: 'dips_tricep',        name: 'Dips triceps',             muscle: 'triceps',   equipment: 'Barre',      type: 'strength' },
  { id: 'close_grip_bench',   name: 'Développé serré',          muscle: 'triceps',   equipment: 'Barre',      type: 'strength' },

  // ── Jambes ─────────────────────────────────────────────────────
  { id: 'squat',              name: 'Squat barre',              muscle: 'legs',      equipment: 'Barre',      type: 'strength' },
  { id: 'front_squat',        name: 'Squat avant',              muscle: 'legs',      equipment: 'Barre',      type: 'strength' },
  { id: 'leg_press',          name: 'Presse à cuisses',         muscle: 'legs',      equipment: 'Machine',    type: 'strength' },
  { id: 'leg_extension',      name: 'Extension jambes',         muscle: 'legs',      equipment: 'Machine',    type: 'strength' },
  { id: 'leg_curl',           name: 'Curl jambes',              muscle: 'legs',      equipment: 'Machine',    type: 'strength' },
  { id: 'lunge',              name: 'Fentes',                   muscle: 'legs',      equipment: 'Haltères',   type: 'strength' },
  { id: 'romanian_dl',        name: 'Soulevé Roumain',          muscle: 'legs',      equipment: 'Barre',      type: 'strength' },
  { id: 'calf_raise',         name: 'Mollets debout',           muscle: 'legs',      equipment: 'Machine',    type: 'strength' },
  { id: 'goblet_squat',       name: 'Goblet squat',             muscle: 'legs',      equipment: 'Haltères',   type: 'strength' },

  // ── Fessiers ───────────────────────────────────────────────────
  { id: 'hip_thrust',         name: 'Hip thrust',               muscle: 'glutes',    equipment: 'Barre',      type: 'strength' },
  { id: 'glute_bridge',       name: 'Pont fessier',             muscle: 'glutes',    equipment: 'Poids corps', type: 'strength' },
  { id: 'cable_kickback',     name: 'Kickback poulie',          muscle: 'glutes',    equipment: 'Poulie',     type: 'strength' },
  { id: 'sumo_squat',         name: 'Squat sumo',               muscle: 'glutes',    equipment: 'Haltères',   type: 'strength' },

  // ── Abdos ──────────────────────────────────────────────────────
  { id: 'crunch',             name: 'Crunch',                   muscle: 'abs',       equipment: 'Poids corps', type: 'strength' },
  { id: 'plank',              name: 'Planche',                  muscle: 'abs',       equipment: 'Poids corps', type: 'time'     },
  { id: 'leg_raise',          name: 'Relevé de jambes',         muscle: 'abs',       equipment: 'Barre',      type: 'strength' },
  { id: 'russian_twist',      name: 'Rotation russe',           muscle: 'abs',       equipment: 'Poids corps', type: 'strength' },
  { id: 'cable_crunch',       name: 'Crunch poulie',            muscle: 'abs',       equipment: 'Poulie',     type: 'strength' },
  { id: 'ab_wheel',           name: 'Roue abdominale',          muscle: 'abs',       equipment: 'Roue',       type: 'strength' },
  { id: 'mountain_climber',   name: 'Mountain climbers',        muscle: 'abs',       equipment: 'Poids corps', type: 'strength' },

  // ── Cardio ─────────────────────────────────────────────────────
  { id: 'running',            name: 'Course à pied',            muscle: 'cardio',    equipment: 'Aucun',      type: 'cardio'   },
  { id: 'cycling',            name: 'Vélo',                     muscle: 'cardio',    equipment: 'Vélo',       type: 'cardio'   },
  { id: 'rowing_machine',     name: 'Rameur',                   muscle: 'cardio',    equipment: 'Rameur',     type: 'cardio'   },
  { id: 'jump_rope',          name: 'Corde à sauter',           muscle: 'cardio',    equipment: 'Corde',      type: 'cardio'   },
  { id: 'hiit',               name: 'HIIT',                     muscle: 'cardio',    equipment: 'Aucun',      type: 'cardio'   },
];

/** Retourne tous les exercices d'un groupe musculaire */
export function getExercisesByMuscle(muscleId) {
  return EXERCISES.filter(e => e.muscle === muscleId);
}

/** Recherche textuelle dans les exercices */
export function searchExercises(query) {
  const q = query.toLowerCase().trim();
  if (!q) return EXERCISES;
  return EXERCISES.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.equipment.toLowerCase().includes(q)
  );
}

/** Retourne un exercice par id */
export function getExercise(id) {
  return EXERCISES.find(e => e.id === id) || null;
}

/** Templates de programmes */
export const PROGRAMS = [
  {
    id: 'push',
    name: 'Push',
    description: 'Pectoraux · Épaules · Triceps',
    emoji: '⬆️',
    exercises: ['bench_press', 'incline_bench', 'ohp', 'lateral_raise', 'skull_crusher', 'tricep_pushdown'],
  },
  {
    id: 'pull',
    name: 'Pull',
    description: 'Dos · Biceps',
    emoji: '⬇️',
    exercises: ['deadlift', 'lat_pulldown', 'seated_row', 'barbell_curl', 'hammer_curl', 'face_pull'],
  },
  {
    id: 'legs',
    name: 'Legs',
    description: 'Quadriceps · Ischio · Mollets',
    emoji: '🦵',
    exercises: ['squat', 'leg_press', 'romanian_dl', 'leg_curl', 'leg_extension', 'calf_raise'],
  },
  {
    id: 'upper',
    name: 'Upper',
    description: 'Haut du corps complet',
    emoji: '💪',
    exercises: ['bench_press', 'barbell_row', 'ohp', 'lat_pulldown', 'barbell_curl', 'tricep_pushdown'],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Corps entier',
    emoji: '🔥',
    exercises: ['squat', 'bench_press', 'barbell_row', 'ohp', 'deadlift', 'barbell_curl'],
  },
];
