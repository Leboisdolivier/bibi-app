/**
 * BIBIS — Thème visuel
 * Inspiré de l'icône : Muscle Beach Venice, rouge américain bold, bleu sport, 70s/80s
 */

export const colors = {
  // Fonds — chaud et profond, pas de bleu froid
  bg:          '#100800',   // fond principal très sombre chaud
  surface:     '#1E1008',   // cartes / surfaces
  surfaceAlt:  '#2C1810',   // surfaces secondaires
  border:      '#3D2015',   // bordures

  // Couleurs primaires extraites de l'icône
  red:         '#E8291C',   // rouge BIBIS (gras, américain)
  redDark:     '#B01F14',   // rouge foncé
  redSoft:     '#FF4D3D',   // rouge clair hover
  blue:        '#1855CC',   // bleu "L'APPLICATION"
  blueSoft:    '#3B72E8',   // bleu clair

  // Accents chaleureux
  gold:        '#D4A435',   // or/sable Venice Beach
  sand:        '#C4956A',   // sable chaud (texte secondaire)
  cream:       '#FFF5E8',   // blanc cassé chaud

  // Texte
  text:        '#FFF5E8',   // texte principal (blanc chaud)
  textSub:     '#C4956A',   // texte secondaire (sable)
  textMuted:   '#7A5540',   // texte atténué

  // Macros (gardés mais réchauffés)
  protein:     '#4ECDC4',   // cyan protéines
  carbs:       '#F59E0B',   // ambre glucides
  fat:         '#A78BFA',   // violet lipides
  success:     '#22C55E',   // vert validation
};

export const fonts = {
  // Tailles
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  26,
  hero: 34,

  // Poids
  regular:   '400',
  medium:    '600',
  bold:      '700',
  black:     '900',
};

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 999,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
};

// Style de carte standard
export const card = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
};

// Bouton primaire rouge
export const btnPrimary = {
  backgroundColor: colors.red,
  borderRadius: radius.md,
  padding: spacing.lg,
  alignItems: 'center',
};

export default { colors, fonts, radius, spacing, card, btnPrimary };
