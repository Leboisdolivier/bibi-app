import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { fetchProductByBarcode } from '../services/openFoodFacts';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;

export default function BarcodeScanner({ onProductFound, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastBarcode = useRef(null);
  const cooldown = useRef(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarcode = async ({ data, type }) => {
    // Anti-rebond : on ignore si même code dans les 3 secondes
    if (!scanning || loading || cooldown.current) return;
    if (data === lastBarcode.current) return;

    lastBarcode.current = data;
    cooldown.current = true;
    setTimeout(() => { cooldown.current = false; }, 3000);

    setLoading(true);
    setError(null);
    setScanning(false);

    try {
      const product = await fetchProductByBarcode(data);
      if (product) {
        onProductFound(product);
      } else {
        setError(`Produit non trouvé (${data})\nEssayez la recherche manuelle.`);
        setTimeout(() => { setScanning(true); setError(null); }, 2500);
      }
    } catch (e) {
      setError('Erreur réseau. Vérifiez votre connexion.');
      setTimeout(() => { setScanning(true); setError(null); }, 2500);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e94560" size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Caméra requise pour scanner</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Autoriser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
          <Text style={styles.btnGhostText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanning ? handleBarcode : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39', 'itf14', 'datamatrix'],
        }}
      />

      {/* Overlay sombre autour du cadre */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          {/* Cadre transparent + coins */}
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Ligne de scan animée */}
            <View style={styles.scanLine} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scanner un produit</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction / état */}
      <View style={styles.footer}>
        {loading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#e94560" size="small" />
            <Text style={styles.statusText}>  Recherche du produit…</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <Text style={styles.hint}>Centrez le code-barres dans le cadre</Text>
        )}
      </View>
    </View>
  );
}

const CORNER = 22;
const BORDER = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0f0f23', alignItems: 'center', justifyContent: 'center', padding: 24 },
  permText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#e94560', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnGhost: { paddingVertical: 12 },
  btnGhostText: { color: '#8892b0', fontSize: 14 },

  // Overlay
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  overlayMiddle: { flexDirection: 'row', height: FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },

  // Cadre
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#e94560',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#e94560',
    opacity: 0.8,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { color: '#fff', fontSize: 17, fontWeight: '700' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#fff', fontSize: 14 },
  errorText: { color: '#e94560', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
