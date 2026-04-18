import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TimerScreen() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chronomètre</Text>
      <Text style={styles.time}>{formatTime(time)}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, isRunning ? styles.buttonStop : styles.buttonStart]}
          onPress={() => setIsRunning(!isRunning)}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Démarrer'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonReset} onPress={reset}>
          <Text style={styles.buttonText}>Réinitialiser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#100800', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF5E8', marginBottom: 40, letterSpacing: -0.5 },
  time: { fontSize: 80, fontWeight: '900', color: '#E8291C', fontVariant: ['tabular-nums'], marginBottom: 60 },
  buttons: { flexDirection: 'row', gap: 16 },
  button: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
  buttonStart: { backgroundColor: '#1855CC' },
  buttonStop: { backgroundColor: '#E8291C' },
  buttonReset: { backgroundColor: '#2C1810', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12 },
  buttonText: { color: '#FFF5E8', fontSize: 18, fontWeight: '600' },
});
