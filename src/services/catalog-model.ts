export type CatalogMaterial = {
  id: string;
  nombre: string;
  categoriaId: string;
  codigoResina: string | null;
  precioMinKg: number | null;
  precioMaxKg: number | null;
  condicionPrecio: string;
  separacionPlanta: string;
  tipoManejo: string;
  activo: boolean;
  publicable: boolean;
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const price = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

// The Firestore document ID is the reference, including its original case.
export function normalizeMaterial(id: string, data: Record<string, unknown>): CatalogMaterial {
  return {
    id, nombre: text(data.nombre) || text(data.categoriaId),
    categoriaId: text(data.categoriaId),
    codigoResina: text(data.codigoResina) || null,
    precioMinKg: price(data.precioMinKg ?? data.precioMinMxnKg),
    precioMaxKg: price(data.precioMaxKg ?? data.precioMaxMxnKg),
    condicionPrecio: text(data.condicionPrecio),
    separacionPlanta: text(data.separacionPlanta), tipoManejo: text(data.tipoManejo),
    activo: data.activo === true, publicable: data.publicable === true,
  };
}

export function canPublishMaterial(material: CatalogMaterial | null | undefined): material is CatalogMaterial {
  return !!material && !!material.nombre && material.activo && material.publicable;
}

export function referencePrice(material: { precioMinKg?: number | null; precioMaxKg?: number | null }): string {
  const min = price(material.precioMinKg), max = price(material.precioMaxKg);
  const money = (amount: number) => `$${amount.toLocaleString('es-MX', { maximumFractionDigits: 2 })}`;
  if (min !== null && max !== null) {
    if (min > max) return '';
    return `${money(min)}${min === max ? '' : ` – ${money(max)}`} MXN/kg (referencia)`;
  }
  if (min !== null) return `Desde ${money(min)} MXN/kg (referencia)`;
  if (max !== null) return `Hasta ${money(max)} MXN/kg (referencia)`;
  return '';
}

export type MaterialPost = { material?: string; materialId?: string };
export function matchesMaterial(post: MaterialPost, material: { id: string; nombre: string }): boolean {
  return post.materialId ? post.materialId === material.id : post.material === material.nombre;
}
