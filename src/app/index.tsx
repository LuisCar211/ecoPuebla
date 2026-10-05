import { Redirect } from 'expo-router';
import { useSession } from '../services/session';
export default function Index() {
  const { user } = useSession();
  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
