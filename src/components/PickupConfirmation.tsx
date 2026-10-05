import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { brand } from '../constants/brand';
import { errorMessage } from '../services/errors';
import { confirmPickup } from '../services/pickup';
import { canConfirmPickup } from '../services/pickup-state';
import type { Post } from '../services/posts';

export default function PickupConfirmation({ post, uid }: { post: Post; uid?: string }) {
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [done, setDone] = useState(false);
  const close = () => { if (!busy) setVisible(false); };
  const confirm = async () => {
    if (busy || !canConfirmPickup(post, uid)) return;
    setBusy(true); setError('');
    try { await confirmPickup(post.id); setDone(true); setVisible(false); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  };
  if (post.estado === 'recolectado' || done) return <Text style={s.success}>Recolección confirmada. Este material ya no aparece en el mapa.</Text>;
  if (!canConfirmPickup(post, uid)) return null;
  return <View style={s.wrapper}>
    <TouchableOpacity accessibilityRole="button" onPress={() => { setError(''); setVisible(true); }} style={s.button}><Text style={s.buttonText}>Confirmar recolección</Text></TouchableOpacity>
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={s.overlay}><View style={s.panel} accessibilityViewIsModal>
        <Text style={s.title}>¿El reciclador ya recogió el material?</Text>
        <Text style={s.text}>{post.material || 'Material'}{post.quantity != null ? ` · ${post.quantity} kg` : ''}</Text>
        <Text style={s.text}>Al confirmar, quedará como recolectado y se retirará del mapa. La publicación se conserva en tu historial.</Text>
        {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={confirm} style={[s.button, busy && { opacity: .6 }]}><Text style={s.buttonText}>{busy ? 'Confirmando…' : 'Sí, ya fue recogido'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={close} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></TouchableOpacity>
      </View></View>
    </Modal>
  </View>;
}
const s = StyleSheet.create({
  wrapper: { marginBottom: 16 }, button: { backgroundColor: brand.green, borderRadius: 10, padding: 13, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800' }, overlay: { flex: 1, backgroundColor: '#0F172A88', justifyContent: 'center', padding: 20 },
  panel: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 16, width: '100%', maxWidth: 500, alignSelf: 'center' },
  title: { color: brand.ink, fontSize: 19, fontWeight: '800' }, text: { color: brand.muted, lineHeight: 21, marginVertical: 12 },
  cancel: { alignItems: 'center', padding: 13, marginTop: 8 }, cancelText: { color: brand.blue, fontWeight: '700' },
  error: { color: '#B91C1C', marginBottom: 14 }, success: { color: brand.green, marginBottom: 16, lineHeight: 21 },
});
