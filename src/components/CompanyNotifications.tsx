import { Bell, CheckCircle, Clock, UserX } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brand } from '../constants/brand';
import type { Post } from '../services/posts';
import BrandHeader from './BrandHeader';
import PickupConfirmation from './PickupConfirmation';

type Props = { posts: Post[]; uid?: string; loading: boolean; error: string };

export default function CompanyNotifications({ posts, uid, loading, error }: Props) {
  const ownPosts = posts.filter(post => post.uid === uid);
  const notices = ownPosts.filter(post => post.estado === 'apartado' || post.estado === 'ofrecido' || post.estado === 'sin_candidatos' || post.estado === 'recolectado');
  const reserved = notices.filter(post => post.estado === 'apartado').length;

  return <View style={s.page}><BrandHeader title="Avisos" subtitle="Actividad de tus publicaciones" />
    <ScrollView contentContainerStyle={s.body}>
      <View style={s.summary}><Bell size={23} color={brand.blue} /><Text style={s.summaryText}>{reserved} materiales apartados · {notices.length} avisos</Text></View>
      {loading && <ActivityIndicator color={brand.blue} />}
      {!!error && <Text style={s.error}>{error}</Text>}
      {!loading && !error && notices.length === 0 && <Text style={s.empty}>Todavía no hay avisos. Aquí aparecerá cuando se ofrezca, se aparte o no se encuentre a quién ofrecer uno de tus materiales.</Text>}
      {notices.map(post => <View key={post.id} style={s.card}>
        <View style={s.row}>
          {(post.estado === 'apartado' || post.estado === 'recolectado') ? <CheckCircle size={24} color={brand.green} /> : post.estado === 'ofrecido' ? <Clock size={24} color={brand.blue} /> : <UserX size={24} color="#B45309" />}
          <Text style={s.title}>{post.estado === 'recolectado' ? 'Recolección confirmada' : post.estado === 'apartado' ? '¡Material apartado!' : post.estado === 'ofrecido' ? 'Oferta enviada' : 'No hay recicladores disponibles'}</Text>
        </View>
        <Text style={s.text}>{post.material || 'Material'}{post.quantity != null ? ` · ${post.quantity} kg` : ''}</Text>
        <Text style={s.text}>{post.estado === 'recolectado' ? 'Tu empresa confirmó que el reciclador ya recogió el material.' : post.estado === 'apartado' ? 'Un reciclador aceptó y apartó tu material.' : post.estado === 'ofrecido' ? 'Se ofreció el material a un reciclador cercano; esperamos su respuesta.' : 'Puedes volver a iniciar la búsqueda desde Inicio.'}</Text>
        {!!post.address && <Text style={s.address}>Punto de recolección: {post.address}</Text>}
        {post.estado === 'recolectado' && post.recolectadoEn?.toDate && <Text style={s.date}>{post.recolectadoEn.toDate().toLocaleString('es-MX')}</Text>}
        <PickupConfirmation post={post} uid={uid} />
        {post.estado === 'apartado' && post.apartadoEn?.toDate && <Text style={s.date}>{post.apartadoEn.toDate().toLocaleString('es-MX')}</Text>}
      </View>)}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: brand.background },
  body: { padding: 16, paddingBottom: 36, maxWidth: 720, width: '100%', alignSelf: 'center' },
  summary: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 14, marginBottom: 16 },
  summaryText: { color: brand.ink, fontWeight: '800', flexShrink: 1 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: brand.line, borderRadius: 14, padding: 17, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: brand.ink, fontSize: 16, fontWeight: '900', flexShrink: 1 },
  text: { color: brand.muted, marginTop: 7, lineHeight: 20 },
  address: { color: brand.ink, fontSize: 12, marginTop: 9 },
  date: { color: brand.muted, fontSize: 11, marginTop: 8 },
  empty: { padding: 22, backgroundColor: '#FFFFFF', borderRadius: 12, color: brand.muted, lineHeight: 21 },
  error: { color: '#B91C1C', marginBottom: 12 },
});
