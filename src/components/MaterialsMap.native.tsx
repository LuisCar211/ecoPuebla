import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { brand } from '../constants/brand';
import { appearsOnMap } from '../services/pickup-state';
import type { Post } from '../services/posts';
import { materialSymbol } from '../services/material-symbol';

export default function MaterialsMap({ posts, onSelectPost }: { posts: Post[]; onSelectPost?: (id: string) => void }) {
  const map = useRef<MapView>(null);
  const located = posts.filter(appearsOnMap);
  useEffect(() => {
    if (!located.length) return;
    map.current?.fitToCoordinates(located.map(post => post.ubicacion!), {
      edgePadding: { top: 65, right: 45, bottom: 65, left: 45 }, animated: false,
    });
  }, [posts]);

  return <View style={styles.container}>
    <MapView ref={map} style={styles.map} initialRegion={{ latitude: 19.0414, longitude: -98.2063, latitudeDelta: 0.14, longitudeDelta: 0.14 }}>
      {located.map(post => <Marker key={post.id} coordinate={post.ubicacion!} accessibilityLabel={post.material || post.categoriaId || 'Material'} onCalloutPress={() => onSelectPost?.(post.id)}>
        <View style={styles.pin}><Text style={styles.pinText}>{materialSymbol(post)}</Text></View>
        <Callout tooltip={false}><View style={styles.callout}><Text style={styles.title}>{post.material || 'Material'}{post.quantity ? ` · ${post.quantity} kg` : ''}</Text><Text style={styles.details}>{post.address || post.author || 'Punto de recolección'}</Text><Text style={styles.details}>{post.estado === 'apartado' ? 'Apartado' : 'Oferta de material'}</Text>{onSelectPost && <Text style={[styles.details, { color: brand.blue, fontWeight: '700' }]}>Toca aquí para ver la publicación</Text>}</View></Callout>
      </Marker>)}
    </MapView>
    {!located.length && <View pointerEvents="none" style={styles.empty}><Text style={styles.emptyText}>Aún no hay materiales con ubicación para mostrar.</Text></View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { height: 260, borderRadius: 11, overflow: 'hidden', backgroundColor: '#E7F1EB' },
  map: { flex: 1 },
  pin: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: brand.blue, borderRadius: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  pinText: { color: brand.ink, fontSize: 29, lineHeight: 38, textAlign: 'center' },
  callout: { minWidth: 170, maxWidth: 220, padding: 7 },
  title: { color: brand.ink, fontWeight: '800', fontSize: 14 },
  details: { color: brand.muted, fontSize: 12, marginTop: 4 },
  empty: { position: 'absolute', top: 100, left: 20, right: 20, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center' },
  emptyText: { color: brand.ink, fontWeight: '700', textAlign: 'center' },
});
