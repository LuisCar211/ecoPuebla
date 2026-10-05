import { StyleSheet } from 'react-native';
import { brand } from '../constants/brand';
export const authStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: brand.background }, body: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 36, width: '100%', maxWidth: 480, alignSelf: 'center' },
  badge: { alignSelf: 'center', backgroundColor: brand.blue, paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, marginBottom: 14 }, badgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 10, letterSpacing: .4 },
  title: { color: brand.ink, fontWeight: '900', fontSize: 34, textAlign: 'center' }, subtitle: { color: brand.muted, textAlign: 'center', marginTop: 7, lineHeight: 21, marginBottom: 25 },
  card: { backgroundColor: '#FFFFFF', padding: 22, borderRadius: 18, borderWidth: 1, borderColor: brand.line }, label: { fontWeight: '700', color: brand.ink, marginBottom: 7, fontSize: 13 },
  input: { height: 48, borderWidth: 1, borderColor: brand.line, backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 14, color: brand.ink, marginBottom: 17 },
  button: { minHeight: 48, backgroundColor: brand.blue, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 4 }, buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  link: { color: brand.blue, fontWeight: '800', textAlign: 'center', marginTop: 20 }, error: { color: '#B91C1C', marginBottom: 14, lineHeight: 19 },
  footer: { textAlign: 'center', color: brand.muted, marginTop: 24, fontSize: 11 },
});
