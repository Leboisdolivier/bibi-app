/**
 * Script de build + deploy web BIBIS
 * Exécute : node scripts/deploy-web.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

console.log('📦 Export Expo web...');
execSync('npx expo export --platform web', { stdio: 'inherit', cwd: ROOT });

// Copie les fichiers statiques du dossier public/ → dist/
console.log('📋 Copie des fichiers statiques...');
const files = fs.readdirSync(PUBLIC);
files.forEach(file => {
  fs.copyFileSync(path.join(PUBLIC, file), path.join(DIST, file));
  console.log(`  ✓ ${file}`);
});

// Injecte le lien manifest dans index.html
const indexPath = path.join(DIST, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('manifest.json')) {
  html = html.replace(
    '<link rel="icon"',
    '<link rel="manifest" href="/manifest.json" />\n<link rel="apple-touch-icon" href="/bibis-icon.png" />\n<link rel="icon"'
  );
  fs.writeFileSync(indexPath, html);
  console.log('  ✓ manifest.json injecté dans index.html');
}

console.log('🚀 Deploy Firebase Hosting...');
execSync('firebase deploy --only hosting', { stdio: 'inherit', cwd: ROOT });

console.log('\n✅ Déployé sur https://bibis-app.web.app');
