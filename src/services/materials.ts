import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { canPublishMaterial, normalizeMaterial, type CatalogMaterial } from './catalog-model';
import { errorMessage } from './errors';
import { db } from './firebase';
import { useSession } from './session';

export function useMaterials() {
  const { user } = useSession();
  const [materials, setMaterials] = useState<CatalogMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setMaterials([]); setError('');
    if (!user) { setLoading(false); return; }
    setLoading(true);
    return onSnapshot(collection(db, 'materiales'), snapshot => {
      setMaterials(snapshot.docs.map(item => normalizeMaterial(item.id, item.data()))
        .filter(canPublishMaterial).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      setError(''); setLoading(false);
    }, cause => {
      setMaterials([]); setError(errorMessage(cause)); setLoading(false);
    });
  }, [user?.uid]);
  return { materials, loading, error };
}
