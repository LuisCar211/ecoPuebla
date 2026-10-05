import { useRouter } from 'expo-router';
import { Bell, Plus, Recycle } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { brand } from '../constants/brand';
import type { Post } from '../services/posts';
import BrandHeader from './BrandHeader';
import MaterialCard from './MaterialCard';
import PickupConfirmation from './PickupConfirmation';

type Props = {
  posts: Post[];
  uid?: string;
  loading: boolean;
  error: string;
  retryError: string;
  retrying: string | null;
  onRetry: (id: string) => void;
};

export default function CompanyHome({ posts, uid, loading, error, retryError, retrying, onRetry }: Props) {
  const router = useRouter();
  const ownPosts = posts.filter(post => post.uid === uid);
  const reservedCount = ownPosts.filter(post => post.estado === 'apartado').length;

  return <View style={s.page}><BrandHeader title="Mis publicaciones" subtitle="Materiales publicados por tu empresa" />
    <ScrollView contentContainerStyle={s.body}>
      <View style={s.summary}>
        <Recycle color={brand.green} size={29} />
        <Text style={s.summaryTitle}>Tus materiales en EcoPuebla</Text>
        <Text style={s.summaryText}>{ownPosts.length} publicaciones · {reservedCount} apartados · {ownPosts.filter(post => post.estado === 'recolectado').length} recolectados</Text>
        <View style={s.actions}>
          <TouchableOpacity style={s.primary} onPress={() => router.push('/(tabs)/publish')}><Plus size={18} color="#FFFFFF" /><Text style={s.primaryText}>Nueva publicación</Text></TouchableOpacity>
          <TouchableOpacity style={s.secondary} onPress={() => router.push('/(tabs)/messages')}><Bell size={18} color={brand.blue} /><Text style={s.secondaryText}>Ver avisos</Text></TouchableOpacity>
        </View>
      </View>
      <Text style={s.heading}>Publicaciones de tu empresa</Text>
      {loading && <ActivityIndicator color={brand.blue} />}
      {!!error && <Text style={s.error}>{error}</Text>}
      {!!retryError && <Text style={s.error}>{retryError}</Text>}
      {!loading && !error && ownPosts.length === 0 && <View style={s.empty}><Text style={s.emptyText}>Aún no has publicado materiales. Pulsa «Nueva publicación» para empezar.</Text></View>}
      {ownPosts.map(post => <View key={post.id}>
        <MaterialCard post={post} />
        <PickupConfirmation post={post} uid={uid} />
        {(post.estado === 'sin_candidatos' || post.estado === 'buscando') && <TouchableOpacity style={[s.retry, retrying && { opacity: .6 }]} disabled={!!retrying} onPress={() => onRetry(post.id)}><Text style={s.primaryText}>{retrying === post.id ? 'Buscando…' : 'Buscar reciclador de nuevo'}</Text></TouchableOpacity>}
      </View>)}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: brand.background },
  body: { padding: 16, paddingBottom: 36, maxWidth: 720, width: '100%', alignSelf: 'center' },
  summary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 17, padding: 20, alignItems: 'center' },
  summaryTitle: { fontSize: 19, fontWeight: '900', color: brand.ink, marginTop: 10 },
  summaryText: { color: brand.muted, marginTop: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 9, marginTop: 17 },
  primary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: brand.blue, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  secondary: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: brand.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  secondaryText: { color: brand.blue, fontWeight: '800' },
  heading: { color: brand.ink, fontSize: 18, fontWeight: '900', marginTop: 25, marginBottom: 13 },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 13, padding: 24 },
  emptyText: { color: brand.muted, textAlign: 'center', lineHeight: 21 },
  retry: { alignSelf: 'flex-start', backgroundColor: brand.blue, borderRadius: 10, padding: 11, marginBottom: 16 },
  error: { color: '#B91C1C', marginBottom: 12 },
});
