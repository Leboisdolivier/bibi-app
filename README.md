# Bibis App – Sport & Nutrition

Application mobile pour suivre vos entraînements, votre nutrition et votre progression.

## Fonctionnalités

- **Dashboard** : résumé du jour (calories, macros, accès rapide)
- **Nutrition** : journal alimentaire, photo des repas (analyse IA à configurer)
- **Entraînements** : suivi des séances
- **Chronomètre** : timer pour les exercices
- **Profil** : objectifs caloriques, sèche / prise de masse

## Prérequis

- **Node.js** (LTS) : [https://nodejs.org](https://nodejs.org)
- **Expo Go** sur votre téléphone (App Store / Play Store)

## Installation

```bash
cd bibis-app
npm install
npm start
```

Scannez le QR code avec Expo Go pour lancer l'app sur votre téléphone.

## Guide des comptes

Consultez **[GUIDE_COMPTES.md](./GUIDE_COMPTES.md)** pour :
- Créer un compte Expo
- Configurer Firebase (auth, base de données)
- Configurer les APIs de reconnaissance alimentaire

## Structure du projet

```
bibis-app/
├── App.js                 # Point d'entrée + navigation
├── src/
│   └── screens/
│       ├── HomeScreen.js      # Dashboard
│       ├── NutritionScreen.js # Journal alimentaire + photos
│       ├── WorkoutScreen.js   # Entraînements
│       ├── TimerScreen.js     # Chronomètre
│       └── ProfileScreen.js   # Profil et objectifs
├── GUIDE_COMPTES.md       # Guide des services à configurer
└── README.md
```
