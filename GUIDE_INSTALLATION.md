# Comment installer Bibis App sur votre téléphone

Votre icône personnalisée (BIBIS L'APPLICATION) est maintenant configurée dans le projet.

---

## Deux façons d'utiliser l'app

### Option 1 : Expo Go (développement – actuel)

- **Avantage** : Rapide, pas de build
- **Inconvénient** : L’icône affichée est celle d’Expo Go, pas votre icône personnalisée
- **Utilisation** : `npm start` → scanner le QR code avec Expo Go

---

### Option 2 : Application installable (APK Android)

Pour avoir **votre icône** sur l’écran d’accueil et une app autonome :

1. **Créer un compte Expo** (gratuit) : [expo.dev](https://expo.dev)
2. **Installer EAS CLI** :
   ```cmd
   npm install -g eas-cli
   ```
3. **Se connecter** :
   ```cmd
   cd c:\Users\olivi\bibis-app
   eas login
   ```
4. **Configurer le projet** (une seule fois) :
   ```cmd
   eas build:configure
   ```
5. **Générer l’APK** :
   ```cmd
   eas build --platform android --profile preview
   ```
6. Une fois le build terminé (quelques minutes), Expo fournit un **lien de téléchargement**
7. Ouvrez ce lien sur votre téléphone Android et installez l’APK

---

## Résumé

| Méthode   | Icône personnalisée | Installation |
|----------|---------------------|--------------|
| Expo Go  | Non                 | Via QR code  |
| APK EAS  | Oui                 | Fichier .apk |

---

## Note iOS

Pour installer sur iPhone, il faut un compte Apple Developer (99 €/an) et utiliser `eas build --platform ios`.
