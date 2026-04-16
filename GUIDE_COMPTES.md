# Guide : Comptes et services à créer pour Bibis App

Ce guide vous accompagne pour configurer tous les services nécessaires au fonctionnement complet de l'application.

---

## 1. Node.js (obligatoire pour développer)

**Pourquoi ?** React Native et Expo nécessitent Node.js pour fonctionner.

**Comment :**
1. Rendez-vous sur [https://nodejs.org](https://nodejs.org)
2. Téléchargez la version **LTS**
3. Installez en suivant l'assistant
4. Redémarrez votre terminal
5. Vérifiez : `node --version` et `npm --version`

---

## 2. Compte Expo (gratuit)

**Pourquoi ?** Pour tester l'app sur votre téléphone sans configurer Android Studio ou Xcode.

**Comment :**
1. Allez sur [https://expo.dev](https://expo.dev)
2. Cliquez sur **Sign up** (créer un compte)
3. Inscrivez-vous avec email ou Google
4. Installez **Expo Go** sur votre téléphone (App Store / Play Store)
5. Lancez `npm start` dans le projet, scannez le QR code avec Expo Go

---

## 3. Firebase (recommandé pour la suite)

**Pourquoi ?** Authentification, base de données, stockage des photos, synchronisation multi-appareils.

**Comment :**
1. Allez sur [https://console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur **Créer un projet** (ou **Add project**)
3. Donnez un nom (ex. `bibis-app`)
4. Désactivez Google Analytics si vous voulez (optionnel)
5. Créez le projet

**Services à activer :**
- **Authentication** : Email/Password ou Google Sign-In
- **Firestore** : base de données pour entraînements, repas, profil
- **Storage** : stockage des photos de repas

**Installation dans le projet :**
```bash
npm install firebase @react-native-firebase/app
```

---

## 4. API de reconnaissance alimentaire (pour les macros automatiques)

Plusieurs options possibles :

### Option A : Google Cloud Vision + Nutrition (recommandé)
- **URL :** [https://console.cloud.google.com](https://console.cloud.google.com)
- Créez un projet, activez **Cloud Vision API**
- Pour la nutrition : utilisez une API tierce ou un modèle custom
- **Coût :** ~1,50 € / 1000 images (Vision API)

### Option B : Clarifai Food Recognition
- **URL :** [https://www.clarifai.com](https://www.clarifai.com)
- Inscription gratuite, modèle "Food Recognition"
- **Coût :** Gratuit jusqu'à un certain quota

### Option C : Open Food Facts (gratuit, pour produits scannés)
- **URL :** [https://world.openfoodfacts.org](https://world.openfoodfacts.org)
- API gratuite pour les codes-barres
- Pas d'API pour les photos de plats

### Option D : Nutritionix (nutrition détaillée)
- **URL :** [https://developer.nutritionix.com](https://developer.nutritionix.com)
- Bon pour la recherche par nom d'aliment
- Gratuit avec limites

---

## 5. Récapitulatif des priorités

| Priorité | Service        | Quand le créer ?                    |
|----------|----------------|-------------------------------------|
| 1        | Node.js        | Tout de suite (pour lancer le projet) |
| 2        | Compte Expo    | Tout de suite (pour tester sur mobile) |
| 3        | Firebase       | Quand vous voulez sauvegarder les données |
| 4        | API nutrition  | Quand vous voulez l'analyse photo des repas |

---

## 6. Lancer le projet après installation de Node.js

```bash
cd "c:\Users\olivi\Les bibis\bibis-app"
npm install
npm start
```

Puis scannez le QR code avec **Expo Go** sur votre téléphone.

---

## 7. Structure des assets (icônes)

Si l'app ne démarre pas à cause d'icônes manquantes, créez un dossier `assets` et ajoutez des images :
- `icon.png` (1024x1024)
- `splash-icon.png` (1284x2778 ou similaire)
- `adaptive-icon.png` (1024x1024)

Vous pouvez générer des icônes sur [https://www.appicon.co](https://www.appicon.co) ou utiliser des placeholders temporaires.
