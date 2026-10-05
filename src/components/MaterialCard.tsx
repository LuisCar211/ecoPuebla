import { MapPin, Recycle } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { brand } from '../constants/brand';
import type { Post } from '../services/posts';
import { referencePrice } from '../services/catalog-model';
const colors: Record<string, string> = { PET: '#26BDE2', Papel: brand.green, Aluminio: brand.gold, Vidrio: brand.blue, Orgánico: '#3F7E44' };
export default function MaterialCard({ post, onPress }: { post: Post; onPress?: () => void }) {
  const contents = <>
    <View style={[s.row, { flexWrap: 'wrap' }]}><View style={[s.badge, { maxWidth: '100%', backgroundColor: colors[post.material || ''] || brand.blue }]}><Recycle color="white" size={14} /><Text style={[s.badgeText, { flexShrink: 1 }]}>{post.material || 'Comunidad'}</Text></View>{post.quantity != null && <Text style={s.quantity}>{post.quantity} kg</Text>}</View>
    <Text style={s.title}>{post.author || 'Miembro de EcoPuebla'}</Text>
    {!!post.categoriaId && <Text style={s.address}>Categoría: {post.categoriaId}</Text>}
    {!!post.codigoResina && <Text style={s.address}>Código de resina: {post.codigoResina}</Text>}
    {!!referencePrice(post) && <Text style={[s.address, { color: brand.green }]}>{referencePrice(post)}</Text>}
    {!!post.condicionPrecio && <Text style={s.address}>{post.condicionPrecio}</Text>}
    {!!post.content && <Text style={s.content}>{post.content}</Text>}
    {!!post.address && <View style={s.row}><MapPin size={15} color={brand.muted} /><Text style={s.address}>{post.address}</Text></View>}
    {!!post.estado && <Text style={s.status}>{post.estado === 'recolectado' ? 'Recolectado' : post.estado === 'apartado' ? 'Apartado' : post.estado === 'ofrecido' ? 'Oferta enviada al reciclador más cercano' : post.estado === 'sin_candidatos' ? 'No hay recicladores disponibles. Reintenta más tarde.' : 'Buscando reciclador cercano…'}</Text>}
    {!!onPress && <Text style={{ color: brand.blue, fontWeight: '700', marginTop: 12 }}>Ver publicación ›</Text>}
  </>;
  if (onPress) return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver publicación de ${post.material || 'material'}`} style={s.card} onPress={onPress}>{contents}</TouchableOpacity>;
  return <View style={s.card}>{contents}</View>;
}
const s = StyleSheet.create({ card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: brand.line, padding: 16, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 7 }, badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 8, alignSelf: 'flex-start' }, badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' }, quantity: { color: brand.green, fontWeight: '800', marginLeft: 'auto' }, title: { color: brand.ink, fontWeight: '800', fontSize: 15, marginTop: 13 }, content: { color: '#475569', lineHeight: 20, marginVertical: 7 }, address: { color: brand.muted, fontSize: 12, flexShrink: 1, marginTop: 3 }, status: { marginTop: 10, color: brand.deepBlue, fontWeight: '700', fontSize: 12 } });
