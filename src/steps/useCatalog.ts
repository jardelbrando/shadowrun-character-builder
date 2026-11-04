import { useEffect, useState } from 'react';
import type { CatalogEntry } from '../engine/catalog';

let cached: CatalogEntry[] | null = null;

/** O catálogo fica em um arquivo à parte e só é baixado ao abrir a etapa de Recursos. */
export function useCatalog() {
  const [catalog, setCatalog] = useState(cached);
  useEffect(() => {
    if (cached) return;
    void import('../data/catalog.json').then((module) => {
      cached = module.default as CatalogEntry[];
      setCatalog(cached);
    });
  }, []);
  return catalog;
}
