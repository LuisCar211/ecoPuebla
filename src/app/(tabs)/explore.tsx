import { Search } from 'lucide-react-native';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import MaterialCard from '../../components/MaterialCard';
import MaterialDetailsModal from '../../components/MaterialDetailsModal';
import { brand } from '../../constants/brand';
import { matchesMaterial } from '../../services/catalog-model';
import { useMaterials } from '../../services/materials';
import { usePosts } from '../../services/posts';
import { useProfile } from '../../services/profile';
import { useSession } from '../../services/session';

export default function ExploreScreen() {
  const [filter, setFilter] = useState(''); const [search, setSearch] = useState(''); const { posts, loading, error } = usePosts(); const { profile, loading: profileLoading } = useProfile();
  const { materials, error: catalogError } = useMaterials();
  const { user } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => setSelectedId(null), [user?.uid]);
  const options = materials.map(item => ({ key: `id:${item.id}`, id: item.id, nombre: item.nombre }));
  for (const post of posts) {
    if (!post.material) continue;
    const key = post.materialId ? `id:${post.materialId}` : `name:${post.material}`;
    if (!options.some(item => item.key === key) && (post.materialId || !options.some(item => item.nombre === post.material))) {
      options.push({ key, id: post.materialId || '', nombre: post.material });
    }
  }
  const selected = options.find(item => item.key === filter);
  const activeFilter = selected ? filter : '';
  const results = posts.filter(p => (!selected || matchesMaterial(p, selected)) && `${p.material || ''} ${p.categoriaId || ''} ${p.author || ''} ${p.address || ''} ${p.content || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  if (!profileLoading && profile?.rol === 'Empresa') return <Redirect href="/(tabs)/publish" />;
  return <View style={s.page}><BrandHeader title="Explorar" subtitle="Busca y filtra materiales publicados" /><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
    <View style={s.search}><Search size={19} color={brand.muted} /><TextInput style={s.input} value={search} onChangeText={setSearch} placeholder="Buscar PET, papel, ubicación…" placeholderTextColor={brand.muted} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{[{ key: '', nombre: 'Todos' }, ...options].map(item => <TouchableOpacity key={item.key} onPress={() => setFilter(item.key)} style={[s.chip, activeFilter === item.key && s.active]}><Text style={{ color: activeFilter === item.key ? '#FFFFFF' : brand.ink, fontWeight: '700' }}>{item.nombre}</Text></TouchableOpacity>)}</ScrollView>
    {!!catalogError && <Text style={s.error}>No se pudo actualizar el catálogo: {catalogError}</Text>}
    <Text style={s.heading}>Publicaciones {loading ? '' : `• ${results.length}`}</Text>
    {loading && <ActivityIndicator color={brand.blue} />}
    {!!error && <Text style={s.error}>{error}</Text>}
    {!loading && !error && results.length === 0 && <Text style={s.empty}>No hay materiales que coincidan con tu búsqueda.</Text>}
    {results.map(post => <MaterialCard key={post.id} post={post} onPress={() => setSelectedId(post.id)} />)}
  </ScrollView>{selectedId && <MaterialDetailsModal key={selectedId} post={posts.find(post => post.id === selectedId) || null} uid={user?.uid} recycler={profile?.rol === 'Reciclador'} onClose={() => setSelectedId(null)} />}</View>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: brand.background }, body: { padding: 16, paddingBottom: 30, width: '100%', maxWidth: 720, alignSelf: 'center' }, search: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: brand.line, paddingHorizontal: 12 }, input: { flex: 1, minHeight: 46, paddingHorizontal: 10, color: brand.ink }, chips: { gap: 8, paddingVertical: 14 }, chip: { borderWidth: 1, borderColor: brand.line, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: '#FFFFFF' }, active: { backgroundColor: brand.blue, borderColor: brand.blue }, heading: { color: brand.ink, fontWeight: '900', fontSize: 18, marginVertical: 12 }, empty: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 23, textAlign: 'center', color: brand.muted }, error: { color: '#B91C1C', margin: 16 } });
