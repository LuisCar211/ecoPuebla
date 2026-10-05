import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { brand } from '../constants/brand';
import { canPublishMaterial, normalizeMaterial, referencePrice } from '../services/catalog-model';
import { useMaterials } from '../services/materials';
import { MATERIAL_CATEGORIES, materialCategory, type MaterialCategoryId } from '../services/material-categories';
import { publishAssignedPost } from '../services/assignment';
import { errorMessage } from '../services/errors';
import { auth, db } from '../services/firebase';
import { currentCoordinates } from '../services/location';
import { parseCoordinate, parseCoordinatePair } from '../services/coordinate-input';

export default function PublishForm({ visible = true, onClose, embedded = false, onPublished }: { visible?: boolean; onClose?: () => void; embedded?: boolean; onPublished?: () => void }) {
  const [materialId, setMaterialId] = useState(''); const [quantity, setQuantity] = useState(''); const [address, setAddress] = useState(''); const [content, setContent] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { materials, loading: catalogLoading, error: catalogError } = useMaterials();
  const [categoryId, setCategoryId] = useState<MaterialCategoryId | ''>('');
  const categoryMaterials = materials.filter(item => materialCategory(item) === categoryId);
  const selected = categoryMaterials.find(item => item.id === materialId);
  const disabled = busy || catalogLoading || !!catalogError || !selected;
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState('');
  const [coordinateText, setCoordinateText] = useState('');
  const applyCoordinates = () => {
    const point = parseCoordinatePair(coordinateText);
    if (!point) { setError('No se reconoce el formato. Pega latitud y longitud, por ejemplo: 19.0413, -98.2062.'); return; }
    setLatitude(String(point.latitude)); setLongitude(String(point.longitude)); setCoordinateText(''); setError('');
  };
  const locate = async () => {
    setBusy(true); setError('');
    try { const point = await currentCoordinates(); setLatitude(String(point.latitude)); setLongitude(String(point.longitude)); setCoordinateText(''); }
    catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };
  const publish = async () => {
    if (!selected || catalogLoading || catalogError) { setError('Selecciona un material disponible en el catálogo.'); return; }
    const parsed = Number(quantity.replace(',', '.'));
    const pasted = coordinateText.trim() ? parseCoordinatePair(coordinateText) : null;
    const lat = coordinateText.trim() ? pasted?.latitude ?? null : parseCoordinate(latitude, 'latitude');
    const lon = coordinateText.trim() ? pasted?.longitude ?? null : parseCoordinate(longitude, 'longitude');
    if (!Number.isFinite(parsed) || parsed <= 0 || !address.trim()) { setError('Ingresa una cantidad válida y una dirección.'); return; }
    if (lat === null || lon === null) { setError('Revisa las coordenadas: latitud entre -90 y 90, longitud entre -180 y 180. Ejemplo: 19.0413 y -98.2062.'); return; }
    const point = { latitude: lat, longitude: lon };
    if (!auth.currentUser) { setError('Inicia sesión para publicar.'); return; }
    setBusy(true); setError('');
    try {
      const user = auth.currentUser;
      const profile = await getDoc(doc(db, 'usuarios', user.uid));
      if (profile.data()?.rol !== 'Empresa') throw new Error('Solo las cuentas de Empresa pueden publicar materiales.');
      const materialDoc = await getDoc(doc(db, 'materiales', selected.id));
      const material = materialDoc.exists() ? normalizeMaterial(materialDoc.id, materialDoc.data()) : null;
      if (!canPublishMaterial(material)) throw new Error('Este material ya no está disponible para publicar. Selecciona otro.');
      await publishAssignedPost({
        uid: user.uid, author: profile.data()?.nombre || user.displayName || user.email || 'Empresa',
        materialId: material.id, material: material.nombre, categoriaId: material.categoriaId,
        codigoResina: material.codigoResina, precioMinKg: material.precioMinKg,
        precioMaxKg: material.precioMaxKg, condicionPrecio: material.condicionPrecio,
        quantity: parsed, address: address.trim(), content: content.trim(), ubicacion: point,
        descartados: [],
      });
      setCategoryId(''); setMaterialId(''); setQuantity(''); setAddress(''); setContent(''); setLatitude(''); setLongitude(''); setCoordinateText('');
      if (onPublished) onPublished(); else onClose?.();
    } catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  };
  const fields = <ScrollView style={!embedded ? { maxHeight: '95%', flexGrow: 0 } : undefined} contentContainerStyle={[s.card, embedded && s.embeddedCard]} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Publicar material</Text><Text style={s.hint}>Al publicar se buscará al reciclador disponible más cercano. Si no hay candidatos, podrás buscar de nuevo desde Inicio.</Text>
    <Text style={s.label}>Tipo de material</Text>
    {catalogLoading && <ActivityIndicator color={brand.blue} />}
    {!!catalogError && <Text style={s.error}>No se pudo cargar el catálogo: {catalogError}</Text>}
    {!catalogLoading && !catalogError && materials.length === 0 && <Text style={s.hint}>No hay materiales disponibles. Revisa que los documentos de materiales tengan nombre, activo: true y publicable: true.</Text>}
    <View style={s.chips}>{MATERIAL_CATEGORIES.map(category => <TouchableOpacity key={category.id} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: categoryId === category.id }} style={[s.chip, categoryId === category.id && s.chipActive]} onPress={() => { if (categoryId !== category.id) { setCategoryId(category.id); setMaterialId(''); } setError(''); }}><Text style={{ color: categoryId === category.id ? '#FFFFFF' : brand.ink, fontWeight: '700' }}>{`${category.nombre} ${category.emoji}`}</Text></TouchableOpacity>)}</View>
    {!categoryId && <Text style={s.hint}>Selecciona una categoría para ver sus materiales.</Text>}
    {!!categoryId && <>
      <Text style={s.label}>Material</Text>
      {!catalogLoading && !catalogError && categoryMaterials.length === 0 && <Text style={s.hint}>No hay materiales disponibles en esta categoría.</Text>}
      <View style={s.chips}>{categoryMaterials.map(item => <TouchableOpacity key={item.id} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: materialId === item.id }} style={[s.chip, materialId === item.id && s.chipActive]} onPress={() => { setMaterialId(item.id); setError(''); }}><Text style={{ color: materialId === item.id ? '#FFFFFF' : brand.ink, fontWeight: '700' }}>{item.nombre}</Text></TouchableOpacity>)}</View>
    </>}
    {!!materialId && !selected && !catalogLoading && <Text style={s.error}>El material seleccionado ya no está disponible. Selecciona otro.</Text>}
    {selected && <View style={{ backgroundColor: brand.background, padding: 12, borderRadius: 10, marginTop: 12 }}>
      {!!selected.categoriaId && <Text style={s.hint}>Categoría: {selected.categoriaId}</Text>}
      {!!selected.codigoResina && <Text style={s.hint}>Código de resina: {selected.codigoResina}</Text>}
      {!!referencePrice(selected) && <Text style={{ color: brand.green, fontWeight: '700' }}>{referencePrice(selected)}</Text>}
      {!!selected.condicionPrecio && <Text style={s.hint}>Condición del precio: {selected.condicionPrecio}</Text>}
      {!!selected.tipoManejo && <Text style={s.hint}>Manejo: {selected.tipoManejo}</Text>}
      {!!selected.separacionPlanta && <Text style={s.hint}>Separación en planta: {selected.separacionPlanta}</Text>}
      <Text style={s.hint}>El rango del catálogo es orientativo; no fija el precio de esta publicación.</Text>
    </View>}
    <Text style={s.label}>Cantidad en kg</Text><TextInput style={s.input} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Ej. 12" />
    <Text style={s.label}>Dirección o punto de recolección</Text><TextInput style={s.input} value={address} onChangeText={setAddress} placeholder="Ej. Puebla, colonia y calle" />
    <Text style={s.label}>Coordenadas del material</Text><Text style={s.hint}>Escribe latitud y longitud por separado o pega el par completo. Se aceptan decimales y grados, minutos y segundos. En Puebla la longitud normalmente es negativa (oeste).</Text>
    <TouchableOpacity style={s.locate} disabled={busy} onPress={locate}><Text style={{ color: brand.blue, fontWeight: '800' }}>Usar mi ubicación actual</Text></TouchableOpacity>
    <TextInput style={s.input} value={coordinateText} onChangeText={setCoordinateText} editable={!busy} autoCapitalize="none" autoCorrect={false} placeholder="Pegar coordenadas: 19.0413, -98.2062" accessibilityLabel="Pegar coordenadas" />
    <TouchableOpacity style={[s.locate, { marginTop: 10 }]} disabled={busy || !coordinateText.trim()} onPress={applyCoordinates}><Text style={{ color: brand.blue, fontWeight: '800' }}>Usar coordenadas pegadas</Text></TouchableOpacity>
    <Text style={s.hint}>Primero latitud, después longitud. Ejemplo: 19.0413, -98.2062. Si usas coma decimal: 19,0413; -98,2062.</Text>
    <View style={s.actions}><TextInput style={[s.input, { flex: 1 }]} value={latitude} onChangeText={value => { setLatitude(value); setCoordinateText(''); }} editable={!busy} autoCorrect={false} placeholder="Latitud (19.0413)" accessibilityLabel="Latitud" /><TextInput style={[s.input, { flex: 1 }]} value={longitude} onChangeText={value => { setLongitude(value); setCoordinateText(''); }} editable={!busy} autoCorrect={false} placeholder="Longitud (-98.2062)" accessibilityLabel="Longitud" /></View>
    <Text style={s.label}>Descripción (opcional)</Text><TextInput style={[s.input, { minHeight: 72, textAlignVertical: 'top' }]} multiline value={content} onChangeText={setContent} placeholder="Estado y detalles del material" />
    {!!error && <Text style={s.error}>{error}</Text>}
    <View style={[s.actions, { marginTop: 20 }]}>{!embedded && <TouchableOpacity style={[s.button, { backgroundColor: '#E2E8F0' }]} onPress={onClose}><Text style={{ color: brand.ink, fontWeight: '800' }}>Cancelar</Text></TouchableOpacity>}<TouchableOpacity style={[s.button, { backgroundColor: brand.green, opacity: disabled ? .6 : 1 }]} disabled={disabled} onPress={publish}><Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{busy ? 'Publicando…' : 'Publicar material'}</Text></TouchableOpacity></View>
  </ScrollView>;
  if (embedded) return fields;
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View style={s.overlay}>{fields}</View></Modal>;
}
const s = StyleSheet.create({ overlay: { flex: 1, backgroundColor: '#0F172A88', justifyContent: 'center', padding: 16 }, card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22, width: '100%', maxWidth: 520, alignSelf: 'center' }, embeddedCard: { width: '94%', marginTop: 16, marginBottom: 35 }, title: { fontSize: 21, color: brand.ink, fontWeight: '900' }, hint: { color: brand.muted, marginTop: 4, marginBottom: 12, fontSize: 12, lineHeight: 18 }, label: { color: brand.ink, fontWeight: '700', marginTop: 10, marginBottom: 7 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { borderColor: brand.line, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }, chipActive: { backgroundColor: brand.blue, borderColor: brand.blue }, input: { borderWidth: 1, borderColor: brand.line, borderRadius: 10, padding: 12, color: brand.ink }, locate: { alignSelf: 'flex-start', marginBottom: 12 }, error: { color: '#B91C1C', marginTop: 12 }, actions: { flexDirection: 'row', gap: 9 }, button: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 13 } });
