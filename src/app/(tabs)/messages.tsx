import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import CompanyNotifications from '../../components/CompanyNotifications';
import { brand } from '../../constants/brand';
import { errorMessage } from '../../services/errors';
import { answerOffer } from '../../services/assignment';
import { usePosts, type Post } from '../../services/posts';
import { useSession } from '../../services/session';
import { useProfile } from '../../services/profile';

export default function OffersScreen() {
  const { profile } = useProfile();
  const { user } = useSession();
  const { posts, loading, error } = usePosts();
  if (profile?.rol === 'Empresa') return <CompanyNotifications posts={posts} uid={user?.uid} loading={loading} error={error} />;
  return <RecyclerOffers user={user} posts={posts} loading={loading} error={error} />;
}

function RecyclerOffers({ user, posts, loading, error }: { user: ReturnType<typeof useSession>['user']; posts: Post[]; loading: boolean; error: string }) {
  const [busy, setBusy] = useState<string | null>(null); const [actionError, setActionError] = useState('');
  const offers = posts.filter(post => post.ofrecidoA === user?.uid && post.estado === 'ofrecido');
  const reserved = posts.filter(post => post.apartadoPara === user?.uid && post.estado === 'apartado');
  const collected = posts.filter(post => post.apartadoPara === user?.uid && post.estado === 'recolectado');
  const answer = async (post: Post, accept: boolean) => {
    if (!user) return;
    setBusy(post.id); setActionError('');
    try {
      await answerOffer(post.id, accept);
    } catch (cause) { setActionError(errorMessage(cause)); } finally { setBusy(null); }
  };
  return <View style={s.page}><BrandHeader title="Ofertas" subtitle="Materiales ofrecidos a tu cuenta" /><ScrollView contentContainerStyle={s.body}>
    {!!error && <Text style={s.error}>{error}</Text>}{!!actionError && <Text style={s.error}>{actionError}</Text>}
    {loading && <ActivityIndicator color={brand.blue} />}
    <Text style={s.section}>Pendientes de respuesta • {offers.length}</Text>
    {!loading && offers.length === 0 && <Text style={s.empty}>No tienes ofertas pendientes. Si eres reciclador, registra tu ubicación en Perfil para recibirlas.</Text>}
    {offers.map(post => <View key={post.id} style={s.card}><Clock color={brand.blue} size={25} /><Text style={s.title}>{post.material || 'Material'} • {post.quantity} kg</Text><Text style={s.text}>{post.author} · {post.address}</Text>{typeof post.distanciaKm === 'number' && <Text style={s.text}>Aproximadamente {post.distanciaKm.toFixed(1)} km en línea recta</Text>}{!!post.content && <Text style={s.text}>{post.content}</Text>}
      <View style={s.actions}><TouchableOpacity disabled={busy === post.id} onPress={() => answer(post, false)} style={[s.button, { backgroundColor: '#FEF2F2' }]}><XCircle color="#B91C1C" size={16} /><Text style={{ color: '#B91C1C', fontWeight: '800' }}>No lo quiero</Text></TouchableOpacity><TouchableOpacity disabled={busy === post.id} onPress={() => answer(post, true)} style={[s.button, { backgroundColor: brand.green }]}><CheckCircle color="#FFFFFF" size={16} /><Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Apartarlo</Text></TouchableOpacity></View>
    </View>)}
    <Text style={s.section}>Apartados para ti • {reserved.length}</Text>
    {reserved.map(post => <View key={post.id} style={s.card}><Text style={s.title}>{post.material} • {post.quantity} kg</Text><Text style={s.text}>Apartado a tu nombre. Punto de recolección: {post.address}</Text></View>)}
    <Text style={s.section}>Recolectados • {collected.length}</Text>
    {collected.map(post => <View key={post.id} style={s.card}><Text style={s.title}>{post.material} • {post.quantity} kg</Text><Text style={s.text}>La empresa confirmó la recolección. {post.address}</Text></View>)}
  </ScrollView></View>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: brand.background }, body: { padding: 16, maxWidth: 720, width: '100%', alignSelf: 'center', paddingBottom: 36 }, section: { color: brand.ink, fontSize: 17, fontWeight: '900', marginVertical: 14 }, card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 14, padding: 17, marginBottom: 12 }, title: { color: brand.ink, fontWeight: '900', fontSize: 16, marginTop: 6 }, text: { color: brand.muted, marginTop: 6 }, empty: { backgroundColor: '#FFFFFF', color: brand.muted, padding: 20, borderRadius: 12, lineHeight: 20 }, actions: { flexDirection: 'row', gap: 9, marginTop: 15 }, button: { flex: 1, borderRadius: 9, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }, error: { color: '#B91C1C', marginBottom: 8 } });
