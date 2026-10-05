import * as Location from 'expo-location';

import type { Coordinates } from './coordinate-input';
export { isCoordinates, type Coordinates } from './coordinate-input';

export async function currentCoordinates(): Promise<Coordinates> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') throw new Error('Se necesita permiso de ubicación para buscar al reciclador más cercano.');
  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: coords.latitude, longitude: coords.longitude };
}
