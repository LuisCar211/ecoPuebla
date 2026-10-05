import { Tabs } from 'expo-router';
import { Compass, Home, Bell, PlusSquare, User } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { brand } from '../../constants/brand';
import { useProfile } from '../../services/profile';

export default function TabLayout() {
  const { profile, loading } = useProfile();
  if (loading) return <View style={{ flex: 1, backgroundColor: brand.background, justifyContent: 'center' }}><ActivityIndicator color={brand.blue} /></View>;
  const isCompany = profile?.rol === 'Empresa';
  return (
    <Tabs key={isCompany ? 'empresa' : 'reciclador'} screenOptions={{ headerShown: false, tabBarActiveTintColor: '#0A97D9', tabBarInactiveTintColor: '#64748B', tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E2E8F0', height: 66, paddingTop: 7, paddingBottom: 7 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar', href: isCompany ? null : undefined, tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tabs.Screen name="publish" options={{ title: 'Publicar', href: isCompany ? undefined : null, tabBarIcon: ({ color, size }) => <PlusSquare color={color} size={size} /> }} />
      <Tabs.Screen name="messages" options={{ title: isCompany ? 'Avisos' : 'Ofertas', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
