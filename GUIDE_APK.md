# Créer l'APK de Bibis App

Guide pas à pas pour générer un fichier APK installable sur Android.

---

## Prérequis

- Compte Expo (gratuit) : [expo.dev/signup](https://expo.dev/signup)
- Node.js installé
- Projet dans `c:\Users\olivi\bibis-app`

---

## Étapes

### 1. Installer EAS CLI

Ouvrez un terminal et exécutez :

```cmd
npm install -g eas-cli
```

---

### 2. Se connecter à Expo

```cmd
cd c:\Users\olivi\bibis-app
eas login
```

Entrez votre email et mot de passe Expo.

---

### 3. Configurer le projet (première fois uniquement)

```cmd
eas build:configure
```

Répondez aux questions si demandé. Le fichier `eas.json` est déjà créé.

---

### 4. Lancer la construction de l'APK

```cmd
eas build --platform android --profile preview
```

- Le build se fait sur les serveurs Expo (pas sur votre PC)
- Durée : environ 10 à 20 minutes
- Un lien pour suivre la progression s'affiche dans le terminal

---

### 5. Télécharger et installer l'APK

1. Quand le build est terminé, un **lien de téléchargement** apparaît
2. Ouvrez ce lien sur votre téléphone Android (ou copiez le fichier APK)
3. Installez l'APK (autorisez l'installation depuis des sources inconnues si demandé)
4. L'app Bibis apparaît sur votre écran d'accueil avec votre icône

---

## En cas d'erreur

**« Project not configured »**  
→ Exécutez `eas build:configure` puis réessayez.

**« Not logged in »**  
→ Exécutez `eas login`.

**« Build failed »**  
→ Consultez les logs sur [expo.dev](https://expo.dev) dans votre projet → Builds.
