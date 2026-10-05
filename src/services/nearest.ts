export type Point = { latitude: number; longitude: number };
export type Recycler = { id: string; disponible?: boolean; ubicacion?: unknown };
export type AssignablePost = { uid: string; ubicacion?: unknown; descartados?: string[] };

export function validPoint(point: unknown): point is Point {
  if (!point || typeof point !== 'object') return false;
  const value = point as Point;
  return Number.isFinite(value.latitude) && Number.isFinite(value.longitude)
    && Math.abs(value.latitude) <= 90 && Math.abs(value.longitude) <= 180;
}
export function distanceKm(from: Point, to: Point): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(to.latitude - from.latitude), dLon = radians(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.latitude))
    * Math.cos(radians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1, Math.max(0, a))), Math.sqrt(Math.max(0, 1 - a)));
}
export function closestRecipient(post: AssignablePost, users: Recycler[]) {
  if (!validPoint(post.ubicacion)) throw new Error('La publicación necesita coordenadas válidas para buscar reciclador.');
  const origin = post.ubicacion;
  const excluded = new Set([post.uid, ...(post.descartados || [])]);
  const eligible = users.flatMap(user => user.disponible === true && validPoint(user.ubicacion) && !excluded.has(user.id)
    ? [{ id: user.id, distanceKm: distanceKm(origin, user.ubicacion) }] : []);
  eligible.sort((a, b) => a.distanceKm - b.distanceKm || a.id.localeCompare(b.id));
  return eligible[0] || null;
}
export function assignmentFields(post: AssignablePost, users: Recycler[]) {
  const recipient = closestRecipient(post, users);
  return {
    estado: recipient ? 'ofrecido' as const : 'sin_candidatos' as const,
    ofrecidoA: recipient?.id || null,
    participantes: recipient ? [post.uid, recipient.id] : [post.uid],
    distanciaKm: recipient ? Math.round(recipient.distanceKm * 10) / 10 : null,
  };
}
