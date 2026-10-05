import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { brand } from '../constants/brand';
import { SessionProvider, useSession } from '../services/session';

function Navigation() {
  const { user, loading } = useSession();
  if (loading) return <View style={{ flex: 1, backgroundColor: brand.background, justifyContent: 'center' }}><ActivityIndicator color={brand.blue} /></View>;
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Protected guard={!user}><Stack.Screen name="(auth)" /></Stack.Protected>
    <Stack.Protected guard={!!user}><Stack.Screen name="(tabs)" /></Stack.Protected>
  </Stack>;
}
export default function RootLayout() { return <SessionProvider><Navigation /></SessionProvider>; }
