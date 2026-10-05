import { Leaf } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { brand } from '../constants/brand';

export default function BrandHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View>
    <View style={styles.strip}>{brand.ods.map((color, i) => <View key={i} style={{ flex: 1, backgroundColor: color }} />)}</View>
    <View style={styles.header}>
      <View style={styles.logo}><Leaf color="#FFFFFF" size={22} /></View>
      <View style={{ flex: 1 }}><Text style={styles.title}>EcoPuebla <Text style={{ color: brand.blue }}>• {title}</Text></Text><Text style={styles.subtitle}>{subtitle || 'Economía circular en Puebla'}</Text></View>
    </View>
  </View>;
}
const styles = StyleSheet.create({ strip: { flexDirection: 'row', height: 6 }, header: { backgroundColor: brand.surface, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: brand.line }, logo: { width: 38, height: 38, borderRadius: 10, backgroundColor: brand.blue, alignItems: 'center', justifyContent: 'center' }, title: { color: brand.ink, fontSize: 17, fontWeight: '800' }, subtitle: { color: brand.muted, fontSize: 11, marginTop: 2 } });
