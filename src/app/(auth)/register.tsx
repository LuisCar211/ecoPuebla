import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import { brand, type Role } from '../../constants/brand';
import { errorMessage } from '../../services/errors';
import { auth, db } from '../../services/firebase';
import { authStyles as s } from '../../components/auth-styles';

const roles: { role: Role; description: string; color: string }[] = [
  { role: 'Empresa', description: 'Publica materiales disponibles', color: brand.blue },
  { role: 'Reciclador', description: 'Descubre materiales para recuperar', color: brand.green },
  { role: 'Universidad', description: 'Participa en la economía circular', color: brand.gold },
];
export default function RegisterScreen() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<Role>('Reciclador');
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const register = async () => {
    if (!name.trim() || !email.trim() || !password) { setError('Completa todos los campos.'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // La sesión creada por Firebase abre la aplicación. Guardar el perfil es un paso independiente.
      try {
        await updateProfile(credential.user, { displayName: name.trim() });
        await setDoc(doc(db, 'usuarios', credential.user.uid), {
          id: credential.user.uid,
          nombre: name.trim(),
          correo: credential.user.email,
          acreditado: false,
          rol: role,
        });
      } catch (cause) { setNotice(`Tu cuenta se creó, pero no se pudo guardar el perfil: ${errorMessage(cause)}`); }
    } catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); }
  };
  return <View style={s.page}><BrandHeader title="Crear cuenta" />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.badge}><Text style={s.badgeText}>ÚNETE A LA COMUNIDAD</Text></View>
        <Text style={s.title}>Crea tu cuenta</Text><Text style={s.subtitle}>Elige cómo participar en EcoPuebla.</Text>
        <View style={s.card}>
          <Text style={s.label}>Tu rol</Text>
          {roles.map(item => <TouchableOpacity key={item.role} onPress={() => setRole(item.role)} accessibilityRole="radio" accessibilityState={{ selected: role === item.role }} style={{ borderLeftWidth: 5, borderLeftColor: item.color, borderWidth: 1, borderColor: role === item.role ? item.color : brand.line, borderRadius: 10, padding: 11, marginBottom: 9, backgroundColor: role === item.role ? '#F0F9FF' : '#FFFFFF' }}><Text style={{ color: brand.ink, fontWeight: '800' }}>{item.role} {role === item.role ? '✓' : ''}</Text><Text style={{ color: brand.muted, fontSize: 12 }}>{item.description}</Text></TouchableOpacity>)}
          <Text style={s.label}>Nombre completo</Text><TextInput style={s.input} value={name} onChangeText={setName} autoComplete="name" placeholder="Tu nombre" />
          <Text style={s.label}>Correo electrónico</Text><TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="tu@correo.com" />
          <Text style={s.label}>Contraseña</Text><TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="Mínimo 6 caracteres" />
          {!!error && <Text style={s.error}>{error}</Text>}{!!notice && <Text style={s.error}>{notice}</Text>}
          <TouchableOpacity style={[s.button, loading && { opacity: .6 }]} disabled={loading} onPress={register}><Text style={s.buttonText}>{loading ? 'Creando cuenta…' : 'Registrarme'}</Text></TouchableOpacity>
          <Link href="/(auth)/login" asChild><TouchableOpacity><Text style={s.link}>Ya tengo cuenta • Iniciar sesión</Text></TouchableOpacity></Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
