# bibis.app — TODO

## Session en cours
- [x] Fusionner ~/Les bibis et ~/bibis-app → garder ~/bibis-app (version complète)
- [x] Corriger bug NutritionScreen (ImagePicker.MediaTypeOptions déprécié en v17)
- [ ] Reprendre l'appli point par point (vision Yazio + meilleure appli muscu)

## Prochaines étapes (reprise app)
- [ ] Définir l'architecture cible
- [ ] Module Nutrition : journal alimentaire complet, scan barcode, analyse IA
- [ ] Module Workout : programmes, exercices, suivi de charge
- [ ] Module Home : dashboard résumé du jour
- [ ] Module Profil : objectifs, macros, données personnelles
- [ ] Module Timer : chrono repos entre séries

## Notes
- App stack : React Native / Expo SDK 54
- Mode démo (sans Firebase) → user = { uid: 'demo', email: 'demo@bibis.app' }
- Firebase configuré avec placeholders → à connecter quand besoin
