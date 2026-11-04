import type { CoreAttribute, LimitKey } from '../data';
import { gearItemSchema, type Character, type GearItem } from '../schema/character';

/** Valor linear por Nível: [fixo, por Nível]. */
export type Scaled = [number, number];

export interface CatalogWeapon {
  type: 'melee' | 'ranged' | 'thrown';
  acc: string;
  dv: string;
  ap: string;
  reach?: number;
  mode?: string;
  rc?: string;
  ammo?: string;
}

export interface CatalogLevel {
  cost: number;
  avail: number;
  restriction: string;
  essence: number;
  give: number;
}

export interface CatalogEntry {
  id: string;
  name: string;
  tab: string;
  section: string;
  desc: string;
  note?: string;
  cost: Scaled;
  avail: Scaled;
  restriction: string;
  min?: number;
  max?: number;
  ratingLabel?: string;
  levels?: CatalogLevel[];
  essence?: Scaled;
  need?: number | 'R';
  give?: number | 'R' | 'armor';
  modGroup?: string;
  modFor?: string[];
  mount?: string;
  augType?: 'cyber' | 'bio';
  exclusive?: string;
  device?: number;
  armor?: number;
  armorBonus?: number;
  armorBonusPerRating?: number;
  bonuses?: Partial<Record<CoreAttribute, Scaled>>;
  initDice?: Scaled;
  limits?: Partial<Record<LimitKey, Scaled>>;
  lifestyleBonus?: number;
  parentCostMultiplier?: number;
  availIsBonus?: boolean;
  weapon?: CatalogWeapon;
  ammo?: { dv: string; ap: string };
  blast?: { dv: string; ap: string; area: string };
  vehicle?: Record<string, string>;
}

const scaled = ([base, perRating]: Scaled, rating: number) => base + perRating * rating;

export const isRated = (entry: CatalogEntry) => entry.max !== undefined;

export const entryRating = (entry: CatalogEntry, rating?: number) =>
  isRated(entry) ? Math.min(entry.max!, Math.max(entry.min ?? 1, rating ?? entry.min ?? 1)) : 0;

/** Custos do item no Nível escolhido, antes da classe de ampliação. */
export function entryStats(entry: CatalogEntry, rating: number, parent?: GearItem) {
  const level = entry.levels?.[rating - 1];
  const parentCost = entry.parentCostMultiplier && parent ? parent.unitCost * entry.parentCostMultiplier : 0;
  const availability = level ? level.avail : scaled(entry.avail, rating);
  return {
    cost: (level ? level.cost : scaled(entry.cost, rating)) + parentCost,
    availability: entry.availIsBonus && parent ? parent.availability + availability : availability,
    restriction: (level ? level.restriction : entry.restriction) as GearItem['restriction'],
    // Dentro de um item com Capacidade, a ampliação não consome Essência.
    essence: parent ? 0 : level ? level.essence : entry.essence ? scaled(entry.essence, rating) : 0,
    capacityGiven: level?.give || (entry.give === 'armor' ? (entry.armor ?? 0) : entry.give === 'R' ? rating : (entry.give ?? 0)),
    capacityUsed: entry.need === 'R' ? rating : (entry.need ?? 0),
  };
}

export function buildGearItem(
  id: string,
  entry: CatalogEntry,
  options: { rating?: number; grade?: GearItem['grade']; quantity?: number; parent?: GearItem } = {},
): GearItem {
  const rating = entryRating(entry, options.rating);
  const stats = entryStats(entry, rating, options.parent);
  const attributeBonuses: GearItem['attributeBonuses'] = {};
  for (const [key, value] of Object.entries(entry.bonuses ?? {})) attributeBonuses[key as CoreAttribute] = scaled(value, rating);
  const limitBonuses: GearItem['limitBonuses'] = {};
  for (const [key, value] of Object.entries(entry.limits ?? {})) limitBonuses[key as LimitKey] = scaled(value, rating);
  return gearItemSchema.parse({
    id,
    catalogId: entry.id,
    name: entry.name,
    category: entry.section,
    quantity: options.quantity ?? 1,
    rating,
    unitCost: stats.cost,
    availability: stats.availability,
    restriction: stats.restriction,
    // O Nível de Foco é Poder e o de dispositivos com Capacidade não conta como Nível de Dispositivo.
    deviceRating: entry.device ?? (entry.ratingLabel || entry.give === 'R' ? 0 : rating),
    essence: stats.essence,
    grade: entry.augType ? (options.grade ?? 'standard') : 'standard',
    armor: entry.armor ?? 0,
    armorBonus: (entry.armorBonus ?? 0) + (entry.armorBonusPerRating ?? 0) * rating,
    initiativeDice: entry.initDice ? scaled(entry.initDice, rating) : 0,
    attributeBonuses,
    limitBonuses,
    lifestyleBonus: entry.lifestyleBonus ?? 0,
    parentId: options.parent?.id ?? '',
    capacityGiven: stats.capacityGiven,
    capacityUsed: stats.capacityUsed,
    mount: entry.mount ?? '',
    modGroup: entry.modGroup ?? '',
    augType: entry.augType ?? '',
    exclusive: entry.exclusive ?? '',
    weapon: entry.weapon ?? null,
  });
}

/** Reaplica o catálogo ao mudar Nível ou classe, sem perder quantidade e vínculos. */
export function rebuildGearItem(item: GearItem, entry: CatalogEntry, rating: number, grade: GearItem['grade'], parent?: GearItem): GearItem {
  return { ...buildGearItem(item.id, entry, { rating, grade, quantity: item.quantity, parent }), notes: item.notes };
}

export function removeGearItem(c: Character, id: string) {
  c.gear = c.gear.filter((item) => item.id !== id && item.parentId !== id);
}

export const childrenOf = (c: Character, id: string) => c.gear.filter((item) => item.parentId === id);

export const capacityUsed = (c: Character, id: string) => childrenOf(c, id).reduce((sum, item) => sum + item.capacityUsed * item.quantity, 0);

/** Troca (FOR + 3)F pelo dano final com a Força informada. */
export function weaponDamage(dv: string, strength: number) {
  return dv.replace(/\(FOR(?: \+ (\d+))?\)/, (_, bonus) => `${strength + Number(bonus ?? 0)}`);
}
