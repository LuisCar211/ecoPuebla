import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { brand } from '../constants/brand';
import { answerOffer } from '../services/assignment';
import { errorMessage } from '../services/errors';
import { materialSymbol } from '../services/material-symbol';
import type { Post } from '../services/posts';
import MaterialCard from './MaterialCard';

export default function MaterialDetailsModal({ post, uid, recycler, onClose }: { post: Post | null; uid?: string; recycler: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<'accepted' | 'rejected' | null>(null);
  const offered = recycler && !!uid && post?.estado === 'ofrecido' && post.ofrecidoA === uid;
  const reserved = post?.estado === 'apartado' && post.apartadoPara === uid;
  const close = () => { if (!busy) onClose(); };
  const answer = async (accept: boolean) => {
    if (!post || !offered || busy || response) return;
    setBusy(true); setError('');
    try { await answerOffer(post.id, accept); setResponse(accept ? 'accepted' : 'rejected'); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  };
  return <Modal visible transparent animationType="slide" onRequestClose={close}>
    <View style={s.overlay}><View style={s.panel} accessibilityViewIsModal>
      <View style={s.header}><Text style={s.heading}>{post ? `${materialSymbol(post)} Publicación` : 'Publicación'}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar publicación" disabled={busy} onPress={close} style={s.close}><Text style={s.closeText}>Cerrar</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {post && <MaterialCard post={post} />}
        {!post && !response && <Text style={s.info}>Esta publicación ya no está disponible para tu cuenta.</Text>}
        {response === 'accepted' && <Text accessibilityLiveRegion="polite" style={s.success}>Material apartado a tu nombre. Puedes consultarlo también en Ofertas.</Text>}
        {response === 'rejected' && <Text accessibilityLiveRegion="polite" style={s.info}>Rechazaste esta oferta. Se buscará al siguiente reciclador disponible.</Text>}
        {reserved && !response && <Text style={s.success}>Este material ya está apartado a tu nombre.</Text>}
        {post?.estado === 'recolectado' && <Text style={s.success}>La empresa confirmó la recolección de este material.</Text>}
        {post && post.estado !== 'recolectado' && !offered && !reserved && !response && <Text style={s.info}>Esta publicación no tiene una oferta pendiente dirigida a tu cuenta.</Text>}
        {offered && !response && <>
          <Text style={s.question}>¿Deseas apartar este material?</Text>
          <TouchableOpacity accessibilityRole="button" disabled={busy} style={[s.accept, busy && s.disabled]} onPress={() => answer(true)}><Text style={s.acceptText}>{busy ? 'Procesando…' : 'Apartar material'}</Text></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" disabled={busy} style={[s.reject, busy && s.disabled]} onPress={() => answer(false)}><Text style={s.rejectText}>No lo quiero</Text></TouchableOpacity>
          <Text style={s.note}>Cerrar esta ventana conserva la oferta pendiente.</Text>
        </>}
        {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
      </ScrollView>
    </View></View>
  </Modal>;
}
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#0F172A88', justifyContent: 'center', padding: 16 },
  panel: { backgroundColor: brand.background, borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '90%', alignSelf: 'center', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 10, backgroundColor: '#FFFFFF' },
  heading: { color: brand.ink, fontSize: 20, fontWeight: '800', flexShrink: 1 },
  close: { padding: 10 }, closeText: { color: brand.blue, fontWeight: '700' }, body: { padding: 16 },
  question: { color: brand.ink, fontSize: 17, fontWeight: '800', marginVertical: 12 },
  accept: { backgroundColor: brand.green, padding: 15, alignItems: 'center', borderRadius: 10 },
  acceptText: { color: '#FFFFFF', fontWeight: '800' },
  reject: { backgroundColor: '#FEF2F2', padding: 15, alignItems: 'center', borderRadius: 10, marginTop: 10 },
  rejectText: { color: '#B91C1C', fontWeight: '800' }, disabled: { opacity: .6 },
  note: { color: brand.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  success: { color: brand.green, fontWeight: '800', lineHeight: 22 },
  info: { color: brand.muted, lineHeight: 22 }, error: { color: '#B91C1C', lineHeight: 20, marginTop: 12 },
});
