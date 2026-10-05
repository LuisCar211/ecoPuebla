import { collection, doc, getDocs, runTransaction, serverTimestamp, type DocumentData, type Transaction } from 'firebase/firestore';
import { auth, db } from './firebase';
import { assignmentFields, type AssignablePost, type Recycler } from './nearest';

// Only this minimal directory is shared. Never list private user profiles.
async function directoryRefs() {
  const directory = await getDocs(collection(db, 'recicladores'));
  return directory.docs.map(item => item.ref);
}
type DirectoryRefs = Awaited<ReturnType<typeof directoryRefs>>;
async function readCandidates(tx: Transaction, refs: DirectoryRefs): Promise<Recycler[]> {
  const snapshots = await Promise.all(refs.map(ref => tx.get(ref)));
  return snapshots.filter(item => item.exists()).map(item => ({
    id: item.id, disponible: item.data()?.disponible === true, ubicacion: item.data()?.ubicacion,
  }));
}
function actorUid() {
  if (!auth.currentUser) throw new Error('Inicia sesión para continuar.');
  return auth.currentUser.uid;
}
function requireActor(uid: string) {
  if (auth.currentUser?.uid !== uid) throw new Error('La sesión cambió. Inténtalo de nuevo desde tu cuenta.');
}
function postData(data: DocumentData): AssignablePost {
  return { uid: data.uid, ubicacion: data.ubicacion, descartados: data.descartados || [] };
}

export async function publishAssignedPost(data: DocumentData) {
  const uid = actorUid();
  if (data.uid !== uid) throw new Error('La publicación debe pertenecer a tu cuenta.');
  const refs = await directoryRefs();
  const postRef = doc(collection(db, 'posts'));
  await runTransaction(db, async tx => {
    requireActor(uid);
    const candidates = await readCandidates(tx, refs);
    const assignment = assignmentFields(postData(data), candidates);
    tx.set(postRef, { ...data, ...assignment, descartados: [],
      ofrecidoEn: assignment.ofrecidoA ? serverTimestamp() : null, createdAt: serverTimestamp() });
  });
  return postRef.id;
}

export async function retryAssignment(postId: string) {
  const uid = actorUid(), refs = await directoryRefs();
  await runTransaction(db, async tx => {
    requireActor(uid);
    const postRef = doc(db, 'posts', postId), snapshot = await tx.get(postRef), post = snapshot.data();
    if (!post || post.uid !== uid) throw new Error('Esta publicación no pertenece a tu empresa.');
    if (!['buscando', 'sin_candidatos'].includes(post.estado)) throw new Error('La publicación ya fue ofrecida o apartada.');
    const assignment = assignmentFields(postData(post), await readCandidates(tx, refs));
    tx.update(postRef, { ...assignment, ofrecidoEn: assignment.ofrecidoA ? serverTimestamp() : null });
  });
}

export async function answerOffer(postId: string, accept: boolean) {
  const uid = actorUid(), refs = accept ? [] : await directoryRefs();
  await runTransaction(db, async tx => {
    requireActor(uid);
    const postRef = doc(db, 'posts', postId), snapshot = await tx.get(postRef), post = snapshot.data();
    if (!post || post.estado !== 'ofrecido' || post.ofrecidoA !== uid) throw new Error('Esta oferta ya no está disponible.');
    if (accept) {
      tx.update(postRef, { estado: 'apartado', apartadoPara: uid, apartadoEn: serverTimestamp() });
    } else {
      const descartados = [...new Set<string>([...(post.descartados || []), uid])];
      const assignment = assignmentFields({ ...postData(post), descartados }, await readCandidates(tx, refs));
      tx.update(postRef, { ...assignment, descartados, ofrecidoEn: assignment.ofrecidoA ? serverTimestamp() : null });
    }
  });
}
