import test from 'node:test';
import assert from 'node:assert/strict';
import { assignmentFields, closestRecipient, distanceKm } from '../src/services/nearest.ts';

const point = (longitude) => ({ latitude: 19, longitude });
const post = { uid: 'empresa', ubicacion: point(-98), descartados: [] };
const recycler = (id, longitude, extra = {}) => ({ id, ubicacion: point(longitude), disponible: true, ...extra });

test('publishing assigns nearest eligible recycler and both participant UIDs', () => {
  const users = [recycler('lejos', -98.5), recycler('cerca', -98.01), recycler('empresa', -98)];
  const fields = assignmentFields(post, users);
  assert.equal(fields.estado, 'ofrecido');
  assert.equal(fields.ofrecidoA, 'cerca');
  assert.deepEqual(fields.participantes, ['empresa', 'cerca']);
  assert.ok(fields.distanciaKm > 0 && fields.distanciaKm < 2);
});
test('rejecting excludes that recycler, replaces participants, then exhausts candidates', () => {
  const users = [recycler('a', -98), recycler('b', -98.02)];
  const next = assignmentFields({ ...post, descartados: ['a'] }, users);
  assert.equal(next.ofrecidoA, 'b');
  assert.deepEqual(next.participantes, ['empresa', 'b']);
  const exhausted = assignmentFields({ ...post, descartados: ['a', 'b'] }, users);
  assert.deepEqual(exhausted, { estado: 'sin_candidatos', ofrecidoA: null, participantes: ['empresa'], distanciaKm: null });
});
test('unavailable or invalid locations cannot receive offers; retry uses updated candidates', () => {
  const unavailable = [recycler('a', -98, { disponible: false }), recycler('b', -98, { ubicacion: { latitude: 91, longitude: 0 } })];
  assert.equal(assignmentFields(post, unavailable).estado, 'sin_candidatos');
  assert.equal(assignmentFields(post, [recycler('a', -98)]).ofrecidoA, 'a');
  assert.throws(() => closestRecipient({ uid: 'empresa' }, []), /coordenadas/);
});
test('same device/same coordinates permit zero distance; tied distances have stable order', () => {
  assert.equal(distanceKm(point(-98), point(-98)), 0);
  assert.equal(closestRecipient(post, [recycler('b', -98), recycler('a', -98)]).id, 'a');
  assert.equal(assignmentFields(post, [recycler('a', -98)]).distanciaKm, 0);
});
