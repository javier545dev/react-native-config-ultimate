import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Config from 'react-native-config-ultimate';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example079</Text>
      <Text style={styles.subtitle}>React Native 0.79.5 + Vite + React Native Web</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Environment Variables:</Text>
        {Object.entries(Config).map(([key, value]) => (
          <Text key={key} style={styles.value}>
            {key} = {String(value)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#16213e',
    padding: 24,
    borderRadius: 12,
    minWidth: 300,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
    color: '#4ecca3',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});

export default App;
