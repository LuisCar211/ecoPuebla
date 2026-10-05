import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import PublishForm from '../../components/PublishForm';
import { brand } from '../../constants/brand';
import { useProfile } from '../../services/profile';

export default function PublishScreen() {
  const { profile, loading } = useProfile();
  const router = useRouter();
  if (loading) return <View style={styles.page}><ActivityIndicator color={brand.blue} /></View>;
  if (profile?.rol !== 'Empresa') return <Redirect href="/(tabs)" />;
  return <View style={styles.page}>
    <BrandHeader title="Nueva publicación" subtitle="Ofrece un material desde tu empresa" />
    <PublishForm embedded onPublished={() => router.replace('/(tabs)')} />
  </View>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: brand.background } });
