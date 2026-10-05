import { signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { LogOut, User } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import { brand, type Role } from '../../constants/brand';
import { errorMessage } from '../../services/errors';
import { auth, db } from '../../services/firebase';
import { currentCoordinates } from '../../services/location';
import { useProfile } from '../../services/profile';
import { useSession } from '../../services/session';

export default function ProfileScreen() {
  const { user } = useSession(); const { profile, error: profileError, loading } = useProfile(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user?.displayName || ''); const [role, setRole] = useState<Role>('Reciclador');
  const [notice, setNotice] = useState('');
  const completeProfile = async () => {
    if (!user || !name.trim()) { setError('Escribe tu nombre.'); return; }
    setBusy(true); setError('');
    try {
      await setDoc(doc(db, 'usuarios', user.uid), { id: user.uid, nombre: name.trim(), correo: user.email || '', acreditado: false, rol: role });
      await updateProfile(user, { displayName: name.trim() });
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };
  const saveLocation = async () => {
    if (!user) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const ubicacion = await currentCoordinates();
      const batch = writeBatch(db);
      batch.update(doc(db, 'usuarios', user.uid), { ubicacion, disponible: true });
      batch.set(doc(db, 'recicladores', user.uid), { ubicacion, disponible: true, updatedAt: serverTimestamp() });
      await batch.commit();
      setNotice('Ubicación actualizada. Ya puedes recibir ofertas cercanas.');
    }
    catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };
  const logout = async () => { try { await signOut(auth); } catch (cause) { setError(errorMessage(cause)); } };
  return <View style={s.page}><BrandHeader title="Perfil" /><ScrollView contentContainerStyle={s.body}><View style={s.card}>
    <View style={s.avatar}><User size={38} color={brand.blue} /></View><Text style={s.name}>{user?.displayName || 'Miembro de EcoPuebla'}</Text><Text style={s.email}>{user?.email}</Text>
    {!!profile?.rol && <View style={s.role}><Text style={s.roleText}>{profile.rol}</Text></View>}
    <View style={s.rule} /><Text style={s.description}>Tu cuenta participa en la comunidad de economía circular de Puebla.</Text>
    {!loading && !profile && !profileError && <View style={s.repair}>
      <Text style={s.repairTitle}>Completa tu perfil</Text>
      <Text style={s.description}>Tu cuenta ya existe en Authentication, pero no se pudo guardar el perfil en Firestore. No necesitas registrarte de nuevo.</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Nombre completo" />
      <View style={s.roles}>{(['Empresa', 'Reciclador', 'Universidad'] as Role[]).map(item => <TouchableOpacity key={item} onPress={() => setRole(item)} style={[s.roleChoice, role === item && { borderColor: brand.blue, backgroundColor: '#E3F2FD' }]}><Text style={{ color: brand.ink, fontWeight: '700' }}>{item}</Text></TouchableOpacity>)}</View>
      <TouchableOpacity style={s.locationButton} disabled={busy} onPress={completeProfile}><Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{busy ? 'Guardando…' : 'Guardar perfil'}</Text></TouchableOpacity>
    </View>}
    {profile?.rol === 'Reciclador' && <View style={{ alignItems: 'center', marginTop: 16 }}><Text style={s.description}>Pulsa el botón para guardar tu ubicación y activar las ofertas cercanas. Si ya la guardaste en una versión anterior, actualízala una vez más.</Text><Text style={[s.description, { marginTop: 8, fontSize: 12 }]}>Para calcular cercanía, se comparte tu ubicación y disponibilidad con empresas y recicladores que hayan iniciado sesión. Tu correo y perfil completo permanecen privados con las reglas incluidas.</Text><TouchableOpacity style={s.locationButton} disabled={busy} onPress={saveLocation}><Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{busy ? 'Obteniendo ubicación…' : 'Actualizar mi ubicación'}</Text></TouchableOpacity></View>}
    {!!notice && <Text style={[s.description, { marginTop: 12, color: brand.green }]}>{notice}</Text>}
    {!!profileError && <Text style={s.error}>{profileError}</Text>}{!!error && <Text style={s.error}>{error}</Text>}
    <TouchableOpacity onPress={logout} style={s.logout}><LogOut size={19} color="#B91C1C" /><Text style={s.logoutText}>Cerrar sesión</Text></TouchableOpacity>
  </View></ScrollView></View>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: brand.background }, body: { padding: 18, flexGrow: 1, justifyContent: 'center' }, card: { backgroundColor: '#FFFFFF', borderColor: brand.line, borderWidth: 1, borderRadius: 18, alignItems: 'center', padding: 28, maxWidth: 520, width: '100%', alignSelf: 'center' }, avatar: { backgroundColor: '#E3F2FD', width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' }, name: { color: brand.ink, fontWeight: '900', fontSize: 20, marginTop: 14, textAlign: 'center' }, email: { color: brand.muted, marginTop: 4 }, role: { backgroundColor: '#E8F5E9', borderRadius: 18, paddingVertical: 6, paddingHorizontal: 15, marginTop: 13 }, roleText: { color: brand.green, fontWeight: '800' }, rule: { backgroundColor: brand.line, height: 1, width: '100%', marginVertical: 22 }, description: { color: brand.muted, lineHeight: 21, textAlign: 'center' }, logout: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, marginTop: 24 }, logoutText: { color: '#B91C1C', fontWeight: '800' }, error: { color: '#B91C1C', marginTop: 10 }, locationButton: { backgroundColor: brand.blue, borderRadius: 9, paddingHorizontal: 15, paddingVertical: 11, marginTop: 12 }, repair: { alignItems: 'center', width: '100%', marginTop: 20 }, repairTitle: { color: brand.ink, fontSize: 17, fontWeight: '900', marginBottom: 6 }, input: { width: '100%', borderColor: brand.line, borderWidth: 1, borderRadius: 9, padding: 12, marginTop: 12 }, roles: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 }, roleChoice: { padding: 9, borderWidth: 1, borderColor: brand.line, borderRadius: 9 } });
