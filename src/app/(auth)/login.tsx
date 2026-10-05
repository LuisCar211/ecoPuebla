import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import { auth } from '../../services/firebase';
import { errorMessage } from '../../services/errors';
import { authStyles as s } from '../../components/auth-styles';

export default function LoginScreen() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const login = async () => {
    if (!email.trim() || !password) { setError('Completa tu correo y contraseña.'); return; }
    setLoading(true); setError('');
    try { await signInWithEmailAndPassword(auth, email.trim(), password); }
    catch (cause) { setError(errorMessage(cause)); } finally { setLoading(false); }
  };
  return <View style={s.page}><BrandHeader title="Bienvenido" />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <View style={s.badge}><Text style={s.badgeText}>ODS 12 • 13 • 11 • ECONOMÍA CIRCULAR</Text></View>
        <Text style={s.title}>EcoPuebla</Text>
        <Text style={s.subtitle}>Conectamos a quienes tienen materiales reciclables con quienes pueden aprovecharlos.</Text>
        <View style={s.card}>
          <Text style={s.label}>Correo electrónico</Text><TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="tu@correo.com" />
          <Text style={s.label}>Contraseña</Text><TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" placeholder="Tu contraseña" onSubmitEditing={login} />
          {!!error && <Text style={s.error}>{error}</Text>}
          <TouchableOpacity style={[s.button, loading && { opacity: .6 }]} disabled={loading} onPress={login}><Text style={s.buttonText}>{loading ? 'Ingresando…' : 'Iniciar sesión'}</Text></TouchableOpacity>
          <Link href="/(auth)/register" asChild><TouchableOpacity><Text style={s.link}>¿No tienes una cuenta? Regístrate</Text></TouchableOpacity></Link>
        </View><Text style={s.footer}>Puebla • Materiales • Comunidad</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
