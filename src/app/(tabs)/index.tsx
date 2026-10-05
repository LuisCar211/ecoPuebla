import { useRouter } from 'expo-router';
import { MapPin, Recycle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import CompanyHome from '../../components/CompanyHome';
import MaterialCard from '../../components/MaterialCard';
import MaterialsMap from '../../components/MaterialsMap';
import MaterialDetailsModal from '../../components/MaterialDetailsModal';
import { brand } from '../../constants/brand';
import { usePosts } from '../../services/posts';
import { useProfile } from '../../services/profile';
import { useSession } from '../../services/session';
import { retryAssignment } from '../../services/assignment';
import { errorMessage } from '../../services/errors';

export default function HomeScreen() {
  const { posts, loading, error } = usePosts(); const { profile } = useProfile(); const { user } = useSession(); const [retryError, setRetryError] = useState(''); const router = useRouter();
  const [retrying, setRetrying] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => setSelectedId(null), [user?.uid]);
  const retry = async (id: string) => { if (retrying) return; try { setRetrying(id); setRetryError(''); await retryAssignment(id); } catch (cause) { setRetryError(errorMessage(cause)); } finally { setRetrying(null); } };
  if (profile?.rol === 'Empresa') return <CompanyHome posts={posts} uid={user?.uid} loading={loading} error={error} retryError={retryError} retrying={retrying} onRetry={retry} />;
  return <View style={s.page}><BrandHeader title="Inicio" subtitle="Conectando materiales y personas en Puebla" /><ScrollView contentContainerStyle={s.body}>
    <View style={s.hero}><View style={s.heroIcon}><Recycle size={25} color={brand.green} /></View><Text style={s.heroTitle}>Dale otra vida a tus materiales</Text><Text style={s.heroText}>Consulta tus ofertas y actualiza tu ubicación en Perfil para recibir materiales.</Text></View>
    <View style={s.mapPanel}>
      <Text style={s.mapTitle}>Vista de materiales</Text><Text style={s.mapNote}>Puntos de recolección de tus publicaciones y ofertas. Toca una burbuja para ver el material y la dirección.</Text>
      <MaterialsMap posts={posts} onSelectPost={setSelectedId} />
    </View>
    <View style={s.section}><View style={s.sectionHeading}><MapPin color={brand.blue} size={20} /><Text style={s.heading}>Materiales disponibles</Text></View><TouchableOpacity onPress={() => router.push('/(tabs)/explore')}><Text style={s.link}>Explorar ›</Text></TouchableOpacity></View>
    <Text style={s.explain}>Tus publicaciones y ofertas • {posts.length} en total</Text>
    {loading && <ActivityIndicator style={{ marginTop: 24 }} color={brand.blue} />}
    {!!error && <View style={s.empty}><Text style={s.error}>{error}</Text><Text style={s.small}>Comprueba las reglas de Firestore para la colección posts.</Text></View>}
    {!!retryError && <Text style={s.error}>{retryError}</Text>}
    {!loading && !error && posts.length === 0 && <View style={s.empty}><Recycle color={brand.blue} size={32} /><Text style={s.emptyTitle}>Aún no hay materiales para ti</Text><Text style={s.small}>Cuando haya una oferta dirigida a ti, aparecerá en Ofertas.</Text></View>}
    {posts.slice(0, 12).map(post => <View key={post.id}><MaterialCard post={post} onPress={() => setSelectedId(post.id)} />{post.uid === user?.uid && post.estado === 'sin_candidatos' && <TouchableOpacity onPress={() => retry(post.id)} style={[s.action, { marginTop: 0, marginBottom: 18, alignSelf: 'flex-start' }]}><Text style={s.actionText}>Buscar de nuevo</Text></TouchableOpacity>}</View>)}
  </ScrollView>{selectedId && <MaterialDetailsModal key={selectedId} post={posts.find(post => post.id === selectedId) || null} uid={user?.uid} recycler={profile?.rol === 'Reciclador'} onClose={() => setSelectedId(null)} />}</View>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: brand.background }, body: { padding: 16, paddingBottom: 36, width: '100%', maxWidth: 720, alignSelf: 'center' }, hero: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 17, padding: 20, alignItems: 'center' }, heroIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }, heroTitle: { color: brand.ink, fontSize: 19, fontWeight: '900', marginTop: 10, textAlign: 'center' }, heroText: { color: brand.muted, textAlign: 'center', lineHeight: 20, marginTop: 7 }, action: { backgroundColor: brand.blue, borderRadius: 10, paddingHorizontal: 17, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 }, actionText: { color: '#FFFFFF', fontWeight: '800' }, section: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 23 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 }, heading: { color: brand.ink, fontWeight: '900', fontSize: 18 }, link: { color: brand.blue, fontWeight: '800' }, explain: { color: brand.muted, fontSize: 12, marginTop: 5, marginBottom: 14 }, empty: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 14, alignItems: 'center', padding: 26, marginTop: 6 }, emptyTitle: { color: brand.ink, fontWeight: '800', marginTop: 10 }, small: { color: brand.muted, textAlign: 'center', marginTop: 6 }, error: { color: '#B91C1C', textAlign: 'center' }, mapPanel: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 16, padding: 14, marginTop: 15 }, mapTitle: { color: brand.ink, fontWeight: '900', fontSize: 16 }, mapNote: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 10 } });
