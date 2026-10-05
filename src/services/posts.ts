import { collection, onSnapshot, query, where, type Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { errorMessage } from './errors';
import { useSession } from './session';
import type { Coordinates } from './location';
import type { CatalogMaterial } from './catalog-model';

export type Post = Partial<Pick<CatalogMaterial, 'categoriaId' | 'codigoResina' | 'precioMinKg' | 'precioMaxKg' | 'condicionPrecio'>> & { id: string; materialId?: string; author: string; username?: string; content: string; material?: string; quantity?: number; address?: string; ubicacion?: Coordinates; createdAt?: Timestamp | null; apartadoEn?: Timestamp | null; ofrecidoEn?: Timestamp | null; uid?: string; estado?: 'buscando' | 'ofrecido' | 'apartado' | 'sin_candidatos' | 'recolectado'; recolectadoEn?: Timestamp | null; recolectadoPor?: string; ofrecidoA?: string | null; apartadoPara?: string; distanciaKm?: number; participantes?: string[] };
export function usePosts() {
  const { user } = useSession();
  const [posts, setPosts] = useState<Post[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => {
    setPosts([]); setError('');
    if (!user) { setPosts([]); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(query(collection(db, 'posts'), where('participantes', 'array-contains', user.uid)), snapshot => {
    const next = snapshot.docs.map(item => ({ id: item.id, ...item.data() }) as Post);
    next.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    setPosts(next); setError(''); setLoading(false);
  }, cause => { setError(errorMessage(cause)); setLoading(false); });
  }, [user]);
  return { posts, loading, error };
}
