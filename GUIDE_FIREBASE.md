# Guide Firebase – Configuration complète pour Bibis App

Firebase permet **plusieurs comptes utilisateurs** : chaque personne peut créer son compte et ses données sont isolées.

---

## Étape 1 : Créer un projet Firebase

1. Allez sur **[https://console.firebase.google.com](https://console.firebase.google.com)**
2. Connectez-vous avec votre compte Google
3. Cliquez sur **Créer un projet** (ou **Add project**)
4. Nom du projet : `bibis-app` (ou autre)
5. Google Analytics : activé ou désactivé, au choix
6. Cliquez sur **Créer le projet**

---

## Étape 2 : Activer l’authentification (plusieurs comptes)

1. Dans le menu de gauche : **Build** → **Authentication**
2. Cliquez sur **Commencer** (Get started)
3. Onglet **Sign-in method**
4. Activez **E-mail/Mot de passe** :
   - Cliquez sur **E-mail/Mot de passe**
   - Activez **E-mail/Mot de passe**
   - (Optionnel) Activez **Lien par e-mail** si vous voulez la connexion sans mot de passe
   - Enregistrez
5. (Optionnel) Activez **Google** pour la connexion avec un compte Google

---

## Étape 3 : Créer une base Firestore

1. Menu : **Build** → **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Mode : **Production** (ou **Test** pour le développement)
4. Emplacement : choisissez la région la plus proche (ex. `europe-west1`)
5. Cliquez sur **Activer**

---

## Étape 4 : Activer le stockage (photos des repas)

1. Menu : **Build** → **Storage**
2. Cliquez sur **Commencer**
3. Règles de sécurité : laissez les règles par défaut pour l’instant
4. Emplacement : même région que Firestore
5. Cliquez sur **Terminé**

---

## Étape 5 : Récupérer la configuration

1. Menu : **Paramètres du projet** (icône engrenage) → **Paramètres généraux**
2. Descendez jusqu’à **Vos applications**
3. Cliquez sur l’icône **Web** `</>`
4. Nom de l’app : `bibis-app`
5. Ne cochez pas « Configurer Firebase Hosting » pour l’instant
6. Cliquez sur **Enregistrer l’application**
7. Copiez l’objet `firebaseConfig` affiché :

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "bibis-app.firebaseapp.com",
  projectId: "bibis-app",
  storageBucket: "bibis-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Étape 6 : Configurer dans le projet

1. Ouvrez le fichier **`src/config/firebase.js`** dans votre projet
2. Remplacez les valeurs de `firebaseConfig` par celles copiées à l’étape 5 :
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
3. Enregistrez le fichier et relancez l’app (`npm start`)
4. L’écran de connexion/inscription apparaîtra. Chaque utilisateur peut créer son compte.

---

## Règles de sécurité Firestore (recommandées)

Dans **Firestore** → **Règles**, remplacez par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chaque utilisateur n'accède qu'à ses propres données
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /meals/{mealId} {
      allow read, write: if request.auth != null;
    }
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Règles de sécurité Storage (photos)

Dans **Storage** → **Règles** :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /meals/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Plusieurs comptes : fonctionnement

- Chaque utilisateur crée son compte (email + mot de passe ou Google)
- Les données sont liées à son `userId` (Firebase Auth)
- Chaque compte a ses propres repas, entraînements et objectifs
- Pas de partage de données entre comptes

---

## Récapitulatif des services

| Service        | Rôle                                   |
|----------------|----------------------------------------|
| Authentication | Connexion / inscription multi-comptes |
| Firestore      | Données (repas, entraînements, profil)|
| Storage        | Photos des repas                       |
