import { isCoordinates } from './coordinate-input';
import type { Post } from './posts';

export function canConfirmPickup(post: Post, uid?: string): boolean {
  return !!uid && post.uid === uid && post.estado === 'apartado' && !!post.apartadoPara;
}
export function appearsOnMap(post: Post): boolean {
  return post.estado !== 'recolectado' && isCoordinates(post.ubicacion);
}
