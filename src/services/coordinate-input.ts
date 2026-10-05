export type Coordinates = { latitude: number; longitude: number };
export function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const point = value as Coordinates;
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

export function parseCoordinate(input: string, axis: 'latitude' | 'longitude'): number | null {
  const text = input.trim().toUpperCase().replace(/[−–]/g, '-').replace(/[º˚]/g, '°').replace(/[′’]/g, "'").replace(/[″“”]/g, '"');
  const match = text.match(/^([+-]?\d+(?:[.,]\d+)?)\s*°?\s*(?:(\d+(?:[.,]\d+)?)\s*'\s*(?:(\d+(?:[.,]\d+)?)\s*")?)?\s*([NSEWO])?$/);
  if (!match) return null;
  const [,degrees,minutes,seconds,direction] = match;
  if (direction && !(axis === 'latitude' ? /[NS]/ : /[EWO]/).test(direction)) return null;
  const d = Number(degrees.replace(',', '.')), m = Number((minutes || '0').replace(',', '.')), s = Number((seconds || '0').replace(',', '.'));
  if (m >= 60 || s >= 60 || ((m || s) && !Number.isInteger(d))) return null;
  const negative = degrees.startsWith('-');
  if (direction && ((negative && /[NE]/.test(direction)) || (degrees.startsWith('+') && /[SWO]/.test(direction)))) return null;
  const sign = negative || (direction && /[SWO]/.test(direction)) ? -1 : 1;
  const value = sign * (Math.abs(d) + m / 60 + s / 3600);
  return Math.abs(value) <= (axis === 'latitude' ? 90 : 180) ? value : null;
}

export function parseCoordinatePair(input: string): Coordinates | null {
  const text = input.trim().replace(/^\(/, '').replace(/\)$/, '');
  let parts: string[];
  if (text.includes(';')) parts = text.split(';');
  else {
    const directional = text.match(/^(.+?[NS])\s*[,\s]+(.+?[EWO])$/i);
    if (directional) parts = [directional[1], directional[2]];
    else if (text.split(',').length === 2) parts = text.split(',');
    else parts = text.split(/\s+/);
  }
  if (parts.length !== 2) return null;
  const latitude = parseCoordinate(parts[0], 'latitude'), longitude = parseCoordinate(parts[1], 'longitude');
  return latitude === null || longitude === null ? null : { latitude, longitude };
}
