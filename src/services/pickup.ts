import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function confirmPickup(postId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Inicia sesión para confirmar la recolección.');
  await runTransaction(db, async tx => {
    if (auth.currentUser?.uid !== uid) throw new Error('La sesión cambió. Inténtalo de nuevo desde tu cuenta.');
    const ref = doc(db, 'posts', postId);
    const snapshot = await tx.get(ref);
    const profile = await tx.get(doc(db, 'usuarios', uid));
    const post = snapshot.data();
    if (profile.data()?.rol !== 'Empresa' || !post || post.uid !== uid) throw new Error('Solo la empresa que publicó el material puede confirmar su recolección.');
    if (post.estado === 'recolectado') return;
    if (post.estado !== 'apartado' || !post.apartadoPara) throw new Error('El material debe estar apartado antes de confirmar su recolección.');
    tx.update(ref, { estado: 'recolectado', recolectadoEn: serverTimestamp(), recolectadoPor: uid });
  });
}
