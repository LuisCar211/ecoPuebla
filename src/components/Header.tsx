import { Bell, Leaf, MessageSquare } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Leaf color="#10b981" size={26} />
        <Text style={styles.brandTitle}>EcoPuebla</Text>
      </View>
      <View style={styles.iconGroup}>
        <TouchableOpacity style={styles.iconButton}>
          <Bell color="#94a3b8" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <MessageSquare color="#94a3b8" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34d399',
  },
  iconGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
});