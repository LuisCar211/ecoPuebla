import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMaterial, canPublishMaterial, referencePrice, matchesMaterial } from '../src/services/catalog-model.ts';

test('Carton-corrugado retains its exact ID, null resin and decimal prices', () => {
  const material = normalizeMaterial('Carton-corrugado', {
    nombre: 'Cartón corrugado', categoriaId: 'Papel y Cartón', codigoResina: null,
    precioMinKg: 2.5, precioMaxKg: 4, activo: true, publicable: true,
    condicionPrecio: 'Paca limpia y seca',
  });
  assert.equal(material.id, 'Carton-corrugado');
  assert.equal(material.categoriaId, 'Papel y Cartón');
  assert.equal(material.codigoResina, null);
  assert.equal(material.precioMinKg, 2.5);
  assert.equal(material.precioMaxKg, 4);
  assert.equal(referencePrice(material), '$2.5 – $4 MXN/kg (referencia)');
  assert.equal(canPublishMaterial(material), true);
});

test('categoriaId is authoritative and resin strings remain strings', () => {
  const material = normalizeMaterial('hdpe-pead', {
    nombre: 'HDPE', categoriaId: 'plasticos', categoriaID: 'Incorrecto', codigoResina: '2',
    precioMinKg: 7, precioMaxKg: 10, activo: true, publicable: true,
  });
  assert.equal(material.categoriaId, 'plasticos');
  assert.equal(material.codigoResina, '2');
  assert.equal(normalizeMaterial('x', { categoriaID: 'Incorrecto' }).categoriaId, '');
});

test('new arbitrary IDs work; inactive, nonpublicable and unnamed documents cannot publish', () => {
  const data = { nombre: 'Nuevo material', activo: true, publicable: true };
  assert.equal(canPublishMaterial(normalizeMaterial('futuro-2027', data)), true);
  for (const override of [{ activo: false }, { publicable: false }, { nombre: '' }, { activo: 'true' }]) {
    assert.equal(canPublishMaterial(normalizeMaterial('x', { ...data, ...override })), false);
  }
  assert.equal(canPublishMaterial(null), false);
});

test('missing or invalid prices are omitted rather than displayed as zero or null', () => {
  for (const data of [{}, { precioMinKg: null, precioMaxKg: null }, { precioMinKg: NaN, precioMaxKg: -4 }, { precioMinKg: '2.5' }]) {
    assert.equal(referencePrice(normalizeMaterial('x', data)), '');
  }
  assert.equal(referencePrice({ precioMinKg: 4, precioMaxKg: 2.5 }), '');
  assert.equal(referencePrice({ precioMinKg: 0, precioMaxKg: 0 }), '$0 MXN/kg (referencia)');
  assert.equal(referencePrice({ precioMinKg: 2.5 }), 'Desde $2.5 MXN/kg (referencia)');
});

test('filters use exact IDs for new posts, even after rename, and names for older posts', () => {
  const material = { id: 'Carton-corrugado', nombre: 'Cartón corrugado' };
  assert.equal(matchesMaterial({ materialId: 'Carton-corrugado', material: 'Nombre anterior' }, material), true);
  assert.equal(matchesMaterial({ materialId: 'carton-corrugado', material: material.nombre }, material), false);
  assert.equal(matchesMaterial({ material: material.nombre }, material), true);
  assert.equal(matchesMaterial({ material: 'PET' }, material), false);
});
