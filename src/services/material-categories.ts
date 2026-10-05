import type { CatalogMaterial } from './catalog-model';

export const MATERIAL_CATEGORIES = [
  { id: 'papel', nombre: 'Papel y Cartón', emoji: '🗂️' },
  { id: 'plasticos', nombre: 'Plásticos', emoji: '♻️' },
  { id: 'vidrio', nombre: 'Vidrio', emoji: '🪟' },
  { id: 'ferrosos', nombre: 'Metales Ferrosos', emoji: '⛓️' },
  { id: 'noFerrosos', nombre: 'Metales No Ferrosos', emoji: '🥫' },
  { id: 'organica', nombre: 'Materia Orgánica', emoji: '🍎' },
  { id: 'textiles', nombre: 'Textiles y Calzado', emoji: '👞' },
  { id: 'madera', nombre: 'Madera', emoji: '🪵' },
  { id: 'raee', nombre: 'Residuos de Aparatos Eléctricos y Electrónicos (RAEE) menores', emoji: '💻' },
  { id: 'especial', nombre: 'Materiales de Manejo Especial', emoji: '⚠️' },
] as const;
export type MaterialCategoryId = typeof MATERIAL_CATEGORIES[number]['id'];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function categoryFrom(value: string): MaterialCategoryId | null {
  // Test non-ferrous before ferrous, and electronics before metals/plastics.
  if (/manejoespecial/.test(value)) return 'especial';
  if (/raee|aparatoselectricos|aparatoselectronicos/.test(value)) return 'raee';
  if (/noferroso|aluminio|cobre|bronce|laton/.test(value)) return 'noFerrosos';
  if (/ferroso|acero|hojalata|hierro|chatarra/.test(value)) return 'ferrosos';
  if (/papel|carton|tetrapak/.test(value)) return 'papel';
  if (/plastico|^pet|hdpe|pead|pvc|ldpe|pebd|^pp$|^ps$|polipropileno|poliestireno/.test(value)) return 'plasticos';
  if (/vidrio/.test(value)) return 'vidrio';
  if (/organica|organico|cocina|alimentos|poda|jardin/.test(value)) return 'organica';
  if (/textil|ropa|telas|calzado/.test(value)) return 'textiles';
  if (/madera|tarima/.test(value)) return 'madera';
  return null;
}

// Keep the Firestore ID and categoriaId unchanged; grouping is only for the form.
export function materialCategory(material: Pick<CatalogMaterial, 'id' | 'nombre' | 'categoriaId'>): MaterialCategoryId | null {
  return categoryFrom(normalize(material.categoriaId))
    ?? categoryFrom(normalize(material.id))
    ?? categoryFrom(normalize(material.nombre));
}
