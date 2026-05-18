import { Text, View, StyleSheet, ScrollView } from 'react-native';
import Config from 'react-native-config-ultimate';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>react-native-config-ultimate</Text>
      <Text style={styles.subtitle}>Environment Variables</Text>
      
      {Object.entries(Config).map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  key: {
    flex: 1,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#666',
  },
});
