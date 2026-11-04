import { CORE_ATTRIBUTES, ATTRIBUTE_NAMES, grades, type CoreAttribute } from '../data';
import { capacityUsed, childrenOf, entryRating, isRated, rebuildGearItem, removeGearItem } from '../engine/catalog';
import { gearTotals } from '../engine/derive';
import type { GearItem } from '../schema/character';
import { useCharacter } from '../store';
import { Empty, Field, NumberField, Panel, Select, Stepper, TextField, formatNuyen } from '../ui/primitives';
import { Term } from '../ui/Term';
import { useCatalog } from './useCatalog';

function ItemRow({ item, onInstall, nested = false }: { item: GearItem; onInstall: (item: GearItem) => void; nested?: boolean }) {
  const { character, edit } = useCharacter();
  const catalog = useCatalog();
  const entry = catalog?.find((candidate) => candidate.id === item.catalogId);
  const parent = character.gear.find((candidate) => candidate.id === item.parentId);
  const totals = gearTotals(item);
  const children = childrenOf(character, item.id);
  const used = capacityUsed(character, item.id);

  const replace = (rating: number, grade: GearItem['grade']) =>
    edit((c) => {
      if (!entry) return;
      const index = c.gear.findIndex((candidate) => candidate.id === item.id);
      c.gear[index] = rebuildGearItem(c.gear[index], entry, entryRating(entry, rating), grade, parent);
    });

  const setQuantity = (value: number) =>
    edit((c) => {
      const target = c.gear.find((candidate) => candidate.id === item.id);
      if (target) target.quantity = value;
    });

  return (
    <li className={nested ? 'ml-4 border-l-2 border-accent/50 pl-3' : ''}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line/60 py-1.5">
        <span className="min-w-40 flex-1">
          {item.name || 'Item sem nome'}
          {item.rating > 0 && <span className="ml-2 font-mono text-xs text-mute">Nível {item.rating}</span>}
          <span className="block text-sm text-mute">{entry?.desc ?? item.category}</span>
        </span>
        {entry && isRated(entry) && <Stepper label={`Nível de ${item.name}`} value={item.rating} min={entry.min ?? 1} max={entry.max} onChange={(value) => replace(value, item.grade)} />}
        {entry?.augType && !item.parentId && (
          <div className="w-32"><Select label={`Classe de ${item.name}`} value={item.grade} options={grades.map((g) => ({ value: g.id, label: g.name }))} onChange={(value) => replace(item.rating, value as GearItem['grade'])} /></div>
        )}
        <Stepper label={`Quantidade de ${item.name}`} value={item.quantity} min={1} onChange={setQuantity} />
        <span className="w-24 text-right font-mono text-sm text-amber">
          {formatNuyen(totals.cost)}
          {totals.essence > 0 && <span className="block text-accent">Ess {totals.essence.toFixed(2)}</span>}
        </span>
        {item.modGroup && (
          <button type="button" className="btn" onClick={() => onInstall(item)}>
            + Modificar{item.capacityGiven > 0 ? ` (${used}/${item.capacityGiven})` : ''}
          </button>
        )}
        <button type="button" className="btn btn-danger" aria-label={`Remover ${item.name || 'item'}`} onClick={() => edit((c) => removeGearItem(c, item.id))}>✕</button>
      </div>
      {!item.catalogId && <CustomFields item={item} />}
      {children.length > 0 && (
        <ul>
          {children.map((child) => <ItemRow key={child.id} item={child} onInstall={onInstall} nested />)}
        </ul>
      )}
    </li>
  );
}

function CustomFields({ item }: { item: GearItem }) {
  const { edit } = useCharacter();
  const change = (recipe: (g: GearItem) => void) =>
    edit((c) => {
      const target = c.gear.find((candidate) => candidate.id === item.id);
      if (target) recipe(target);
    });
  return (
    <div className="my-2 bg-panel-2 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        <TextField className="col-span-2" label="Item" value={item.name} onChange={(value) => change((g) => void (g.name = value))} />
        <NumberField label="Custo ¥" value={item.unitCost} onChange={(value) => change((g) => void (g.unitCost = value))} />
        <NumberField label="Disp." term="gear:availability" value={item.availability} onChange={(value) => change((g) => void (g.availability = value))} />
        <Field label="R/P" term="gear:restriction">
          <Select label="Restrição" value={item.restriction || 'none'} options={[{ value: 'none', label: '—' }, { value: 'R', label: 'R' }, { value: 'P', label: 'P' }]} onChange={(value) => change((g) => void (g.restriction = value === 'none' ? '' : (value as 'R' | 'P')))} />
        </Field>
        <NumberField label="Nível disp." term="gear:deviceRating" value={item.deviceRating} onChange={(value) => change((g) => void (g.deviceRating = value))} />
        <NumberField label="Armadura" term="stat:armor" value={item.armor} onChange={(value) => change((g) => void (g.armor = value))} />
        <NumberField label="Essência" term="gear:essence" step={0.05} value={item.essence} onChange={(value) => change((g) => void (g.essence = value))} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {CORE_ATTRIBUTES.map((key: CoreAttribute) => (
          <label key={key} className="flex items-center gap-1 text-sm">
            <span className="text-mute"><Term id="gear:bonus" plain>{ATTRIBUTE_NAMES[key].slice(0, 3)}</Term></span>
            <input className="input w-12! px-1! py-0! font-mono" type="number" aria-label={`Bônus de ${ATTRIBUTE_NAMES[key]}`} value={item.attributeBonuses[key] ?? 0} onChange={(event) => change((g) => void (g.attributeBonuses[key] = Number(event.target.value) || 0))} />
          </label>
        ))}
        <NumberField className="w-28" label="+ Dados Inic." term="stat:initiative" value={item.initiativeDice} onChange={(value) => change((g) => void (g.initiativeDice = value))} />
      </div>
    </div>
  );
}

export function OwnedGear({ title, augmented, onInstall, aside }: { title: string; augmented: boolean; onInstall: (item: GearItem) => void; aside?: React.ReactNode }) {
  const { character } = useCharacter();
  const isAug = (item: GearItem) => Boolean(item.augType) || (!item.catalogId && item.essence > 0);
  const roots = character.gear.filter((item) => !item.parentId && isAug(item) === augmented);
  return (
    <Panel title={title} aside={aside}>
      {!roots.length && <Empty>{augmented ? 'Nenhuma ampliação instalada.' : 'Nada comprado ainda.'}</Empty>}
      <ul>
        {roots.map((item) => <ItemRow key={item.id} item={item} onInstall={onInstall} />)}
      </ul>
    </Panel>
  );
}
