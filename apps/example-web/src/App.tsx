import { View, Text, StyleSheet } from 'react-native';
import Config from 'react-native-config-ultimate';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native Config Ultimate</Text>
      <Text style={styles.subtitle}>Web Example with Vite + React Native Web</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Environment Variables:</Text>
        <Text style={styles.value}>HELLO = {Config.HELLO || 'not set'}</Text>
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default App;
