import { MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { brand } from '../constants/brand';
import { appearsOnMap } from '../services/pickup-state';
import type { Post } from '../services/posts';

export default function MaterialsMap({ posts }: { posts: Post[]; onSelectPost?: (id: string) => void }) {
  return <View style={styles.container}><MapPin size={26} color={brand.blue} /><Text style={styles.title}>Mapa disponible en iOS y Android</Text><Text style={styles.note}>Abre la aplicación en Expo Go para ver los puntos en Apple Maps o Google Maps. Aquí puedes consultar {posts.filter(appearsOnMap).length} materiales con ubicación pendientes de recolección en la lista inferior.</Text></View>;
}
const styles = StyleSheet.create({ container: { minHeight: 170, borderRadius: 11, backgroundColor: '#E7F1EB', justifyContent: 'center', alignItems: 'center', padding: 18 }, title: { color: brand.ink, fontWeight: '800', marginTop: 8 }, note: { color: brand.muted, fontSize: 12, textAlign: 'center', marginTop: 5 } });
