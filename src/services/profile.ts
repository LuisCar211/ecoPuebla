import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import type { Role } from '../constants/brand';
import { db } from './firebase';
import { useSession } from './session';
import { errorMessage } from './errors';
import type { Coordinates } from './location';

export type UserProfile = { id: string; nombre: string; correo: string; acreditado: boolean; rol?: Role; ubicacion?: Coordinates; disponible?: boolean };
export function useProfile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setProfile(null); setError('');
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    return onSnapshot(doc(db, 'usuarios', user.uid), snapshot => {
      setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null); setError(''); setLoading(false);
    }, cause => { setError(errorMessage(cause)); setLoading(false); });
  }, [user]);
  return { profile, error, loading };
}
