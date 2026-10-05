type MaterialIdentity = { materialId?: string; material?: string; categoriaId?: string; codigoResina?: string | null };
const normalize = (value?: string | null) => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function materialSymbol(post: MaterialIdentity): string {
  const id = normalize(post.materialId), name = normalize(post.material), category = normalize(post.categoriaId);
  const identity = `${id} ${name}`;
  const combined = `${identity} ${category}`;
  // Specific materials take precedence over their broader category.
  if (/papelmixto|periodico/.test(combined)) return '📰';
  if (/papelblanco|papel.*oficina/.test(combined)) return '📄';
  if (/tetrapak/.test(combined)) return '🧃';
  if ([id, name, category].some(value => value.startsWith('pet') || value.includes('tereftalato'))) return '♳';
  if (/hdpe|pead/.test(combined)) return '♴';
  if (/pvc/.test(combined)) return '♵';
  if (/ldpe|pebd|peliculaplastica/.test(combined)) return '♶';
  if ([id, name, category].includes('pp') || /polipropileno/.test(combined)) return '♷';
  if ([id, name, category].includes('ps') || /poliestireno/.test(combined)) return '♸';
  if (/otrosplasticos|multicapa/.test(combined)) return '♹';
  if (/aparatoselectricos|aparatoselectronicos|raee/.test(combined)) return '🔌';
  if (/manejoespecial/.test(combined)) return '⚠️';
  if (/vidrio/.test(combined)) return '🪟';
  if (/metal|ferroso|aluminio|cobre|chatarra|latas/.test(combined)) return '🥫';
  if (/materiaorganica|organico|cocinaalimentos|podajardin/.test(combined)) return '🍎';
  if (/calzado/.test(combined)) return '👞';
  if (/ropa|telas|textil/.test(combined)) return '👚';
  if (/madera|tarima/.test(combined)) return '🪵';
  if (/papel|carton/.test(combined)) return '🗂️';
  const resin: Record<string, string> = { '1': '♳', '2': '♴', '3': '♵', '4': '♶', '5': '♷', '6': '♸', '7': '♹' };
  return resin[post.codigoResina?.trim() || ''] || '♻️';
}
