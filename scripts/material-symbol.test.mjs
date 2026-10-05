import test from 'node:test';
import assert from 'node:assert/strict';
import { materialSymbol } from '../src/services/material-symbol.ts';
import { normalizeMaterial, canPublishMaterial } from '../src/services/catalog-model.ts';

test('every screenshot document and user requested material has its requested symbol', () => {
  const cases = [
    ['Carton-corrugado', '🗂️'], ['papel-mixtoYperiodico', '📰'], ['papel-blancoOficina', '📄'],
    ['tetraPak', '🧃'], ['pet-transparente', '♳'], ['pet-color', '♳'], ['hdpe-pead', '♴'],
    ['pvc', '♵'], ['ldpe-películaPlastica', '♶'], ['pp', '♷'], ['ps', '♸'], ['otrosPlasticos-multicapa', '♹'],
    ['vidrioAmbar', '🪟'], ['vidrioTransparente', '🪟'], ['vidrioVerde', '🪟'],
    ['aluminioPerfiles-otrosObjetos', '🥫'], ['chatarraFerrosaLigera', '🥫'], ['cobre-otrosMetales', '🥫'],
    ['latasAcero-hojalata', '🥫'], ['latasAluminio', '🥫'], ['cocina-alimentos', '🍎'], ['poda-jardin', '🍎'],
    ['ropa-telas', '👚'], ['calzado', '👞'], ['tarima-maderaEmbalaje', '🪵'],
    ['pequeñosAparatosElectronicos', '🔌'], ['manejoEspecial', '⚠️'],
  ];
  for (const [materialId, symbol] of cases) assert.equal(materialSymbol({ materialId }), symbol, materialId);
});
test('future IDs use categoriaId and accents/case do not change category symbols', () => {
  const cases = [
    ['Papel y cartón', '🗂️'], ['Papel mixto y periódico', '📰'], ['Papel blanco de oficina', '📄'],
    ['Tetra Pak', '🧃'], ['PET transparente y de color', '♳'], ['HDPE/PEAD', '♴'], ['PVC', '♵'],
    ['LDPE/Película Plástica', '♶'], ['PP', '♷'], ['PS', '♸'], ['Otros plásticos y multicapa', '♹'],
    ['Vidrio', '🪟'], ['Metales Ferrosos', '🥫'], ['Metales No Ferrosos', '🥫'], ['Materia Orgánica', '🍎'],
    ['Ropa y telas', '👚'], ['Calzado', '👞'], ['Madera', '🪵'],
    ['Residuos de Aparatos Eléctricos y Electrónicos', '🔌'], ['Materiales de Manejo Especial', '⚠️'],
  ];
  for (const [categoriaId, symbol] of cases) assert.equal(materialSymbol({ materialId: 'nuevo-2027', categoriaId }), symbol, categoriaId);
});
test('specific paper materials override general category and older posts work by name', () => {
  assert.equal(materialSymbol({ materialId: 'papel-mixtoYperiodico', categoriaId: 'Papel y Cartón' }), '📰');
  assert.equal(materialSymbol({ material: 'Papel blanco de oficina', categoriaId: 'Papel y Cartón' }), '📄');
  assert.equal(materialSymbol({ material: 'PET' }), '♳');
  assert.equal(materialSymbol({ material: 'Vidrio' }), '🪟');
  assert.equal(materialSymbol({ codigoResina: '2', categoriaId: 'plasticos' }), '♴');
  assert.equal(materialSymbol({ codigoResina: null }), '♻️');
});
test('category-only manejoEspecial document can be displayed and published without inventing a new ID', () => {
  const material = normalizeMaterial('manejoEspecial', { categoriaId: 'Materiales de Manejo Especial', activo: true, publicable: true });
  assert.equal(material.nombre, 'Materiales de Manejo Especial');
  assert.equal(material.id, 'manejoEspecial');
  assert.equal(canPublishMaterial(material), true);
});
