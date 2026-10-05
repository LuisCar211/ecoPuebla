import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from './firebase';

const Session = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, next => { setUser(next); setLoading(false); }, () => setLoading(false)), []);
  return <Session.Provider value={{ user, loading }}>{children}</Session.Provider>;
}
export function useSession() { return useContext(Session); }
