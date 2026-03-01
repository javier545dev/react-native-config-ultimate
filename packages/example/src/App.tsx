import { Text, View, StyleSheet } from 'react-native';
import Config from 'react-native-config-ultimate';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Config values:</Text>
      <Text>{JSON.stringify(Config, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
