import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ATTRIBUTE_NAMES, grades } from '../data';
import { buildGearItem, entryRating, entryStats, isRated, weaponDamage, type CatalogEntry } from '../engine/catalog';
import { gearTotals } from '../engine/derive';
import type { GearItem } from '../schema/character';
import { newId, useCharacter } from '../store';
import { Empty, Field, Panel, Select, Stepper, formatNuyen } from '../ui/primitives';
import { Term } from '../ui/Term';
import { useCatalog } from './useCatalog';

export interface CatalogTab {
  id: string;
  label: string;
}

const availText = (availability: number, restriction: string) => `${availability || '—'}${restriction}`;

function costText(entry: CatalogEntry) {
  if (entry.levels) return `desde ${formatNuyen(entry.levels[0].cost)}`;
  const [base, perRating] = entry.cost;
  if (entry.parentCostMultiplier) return 'custo da arma';
  if (perRating) return `${base ? `${formatNuyen(base)} + ` : ''}${formatNuyen(perRating)} x ${entry.ratingLabel ?? 'Nível'}`;
  return formatNuyen(base);
}

function Stat({ term, label, value }: { term?: string; label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line/60 py-0.5">
      <span className="text-mute">{term ? <Term id={term}>{label}</Term> : label}</span>
      <span className="font-mono text-accent">{value}</span>
    </div>
  );
}

function EntryDetail({ entry, target, onDone }: { entry: CatalogEntry; target?: GearItem; onDone: () => void }) {
  const { edit, derived } = useCharacter();
  const [rating, setRating] = useState(entry.min ?? 1);
  const [grade, setGrade] = useState<GearItem['grade']>('standard');
  const [quantity, setQuantity] = useState(1);

  const safeRating = entryRating(entry, rating);
  const preview = buildGearItem('preview', entry, { rating: safeRating, grade, quantity, parent: target });
  const totals = gearTotals(preview);
  const stats = entryStats(entry, safeRating, target);
  const weapon = entry.weapon;
  const overAvailability = totals.availability > derived.level.maxAvailability;
  const overRating = preview.deviceRating > derived.level.maxDeviceRating;

  const buy = () => {
    edit((c) => void c.gear.push(buildGearItem(newId(), entry, { rating: safeRating, grade, quantity, parent: target })));
    onDone();
  };

  return (
    <motion.div key={entry.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }}>
      <p className="label text-accent!">{entry.section}</p>
      <h4 className="font-display text-base font-bold uppercase">{entry.name}</h4>
      <p className="mt-1">{entry.desc}</p>
      {entry.note && <p className="mt-1 text-sm text-amber">{entry.note}</p>}

      <div className="mt-3">
        {weapon && <Stat term="gear:accuracy" label="Precisão" value={weapon.acc} />}
        {weapon && <Stat term="gear:damage" label="Dano" value={weapon.dv.includes('FOR') ? `${weapon.dv} = ${weaponDamage(weapon.dv, derived.augmented.strength)}` : weapon.dv} />}
        {weapon && <Stat term="gear:ap" label="PA" value={weapon.ap} />}
        {weapon?.reach !== undefined && <Stat term="gear:reach" label="Alcance" value={weapon.reach} />}
        {weapon?.mode && <Stat term="gear:mode" label="Modo" value={weapon.mode} />}
        {weapon?.rc && <Stat term="gear:rc" label="Compensação de Recuo" value={weapon.rc} />}
        {weapon?.ammo && <Stat term="gear:ammoType" label="Munição" value={weapon.ammo} />}
        {entry.ammo && <Stat term="gear:damage" label="Modificador de dano" value={entry.ammo.dv} />}
        {entry.ammo && <Stat term="gear:ap" label="Modificador de PA" value={entry.ammo.ap} />}
        {entry.blast && <Stat term="gear:damage" label="Dano" value={entry.blast.dv} />}
        {entry.blast && <Stat term="gear:ap" label="PA" value={entry.blast.ap} />}
        {entry.blast && <Stat label="Explosão" value={entry.blast.area} />}
        {entry.mount && <Stat label="Suporte" value={entry.mount} />}
        {entry.armor !== undefined && <Stat term="stat:armor" label="Armadura" value={entry.armor} />}
        {preview.armorBonus > 0 && <Stat term="stat:armor" label="Bônus de Armadura" value={`+${preview.armorBonus}`} />}
        {Object.entries(preview.attributeBonuses).map(([key, value]) => <Stat key={key} term={`attr:${key}`} label={`Bônus de ${ATTRIBUTE_NAMES[key]}`} value={`+${value}`} />)}
        {preview.initiativeDice > 0 && <Stat term="stat:initiative" label="Dados de Iniciativa" value={`+${preview.initiativeDice}D6`} />}
        {entry.vehicle && Object.entries({ handling: 'Manejo', speed: 'Velocidade', accel: 'Aceleração', body: 'Corpo', armor: 'Armadura', pilot: 'Piloto', sensor: 'Sensor', seats: 'Assentos' }).map(([key, label]) => <Stat key={key} label={label} value={entry.vehicle?.[key]} />)}
        {preview.capacityGiven > 0 && <Stat term="gear:capacity" label="Capacidade" value={preview.capacityGiven} />}
        {target && preview.capacityUsed > 0 && <Stat term="gear:capacity" label="Capacidade usada" value={preview.capacityUsed} />}
        {entry.essence || entry.levels ? <Stat term="gear:essence" label="Essência" value={target ? '0 (usa Capacidade)' : totals.essence.toFixed(2)} /> : null}
        <Stat term="gear:availability" label="Disponibilidade" value={availText(totals.availability, stats.restriction)} />
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {isRated(entry) && (
          <Field label={entry.ratingLabel ?? 'Nível'}>
            <Stepper label={entry.ratingLabel ?? 'Nível'} value={safeRating} min={entry.min ?? 1} max={entry.max} onChange={setRating} />
          </Field>
        )}
        <Field label="Quantidade">
          <Stepper label="Quantidade" value={quantity} min={1} onChange={setQuantity} />
        </Field>
        {entry.augType && (
          <Field label="Classe" term="gear:grade">
            <Select label="Classe" value={grade} options={grades.map((g) => ({ value: g.id, label: g.name }))} onChange={(value) => setGrade(value as GearItem['grade'])} />
          </Field>
        )}
      </div>

      {(overAvailability || overRating) && (
        <p className="mt-2 text-sm text-alert">
          {overAvailability ? `Disponibilidade acima de ${derived.level.maxAvailability}, o limite deste nível de jogo.` : `Nível acima de ${derived.level.maxDeviceRating}, o limite deste nível de jogo.`}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-lg text-amber">{formatNuyen(totals.cost)}</span>
        <button type="button" className="btn btn-primary" onClick={buy}>{target ? `Instalar em ${target.name}` : 'Comprar'}</button>
      </div>
    </motion.div>
  );
}

export function CatalogBrowser({ tabs, target, onCancelTarget }: { tabs: CatalogTab[]; target?: GearItem; onCancelTarget: () => void }) {
  const catalog = useCatalog();
  const { derived } = useCharacter();
  const [tab, setTab] = useState(tabs[0].id);
  const [section, setSection] = useState('');
  const [query, setQuery] = useState('');
  const [onlyAllowed, setOnlyAllowed] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  const pool = useMemo(() => {
    if (!catalog) return [];
    if (target) return catalog.filter((entry) => entry.modFor?.includes(target.modGroup));
    return catalog.filter((entry) => entry.tab === tab);
  }, [catalog, tab, target]);

  const sections = useMemo(() => [...new Set(pool.map((entry) => entry.section))], [pool]);
  const text = query.trim().toLowerCase();
  const visible = pool.filter((entry) => {
    if (section && entry.section !== section) return false;
    if (text && !`${entry.name} ${entry.desc} ${entry.section}`.toLowerCase().includes(text)) return false;
    if (!onlyAllowed) return true;
    const stats = entryStats(entry, entryRating(entry));
    return stats.availability <= derived.level.maxAvailability;
  });
  const selected = pool.find((entry) => entry.id === selectedId);

  const changeTab = (id: string) => {
    setTab(id);
    setSection('');
    setSelectedId('');
  };

  if (!catalog) return <Panel><Empty>Carregando catálogo...</Empty></Panel>;

  return (
    <Panel title={target ? `Modificações para ${target.name}` : 'Catálogo'} aside={target && <button type="button" className="btn" onClick={onCancelTarget}>Voltar ao catálogo</button>}>
      {!target && tabs.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tabs.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={tab === id} className={`btn ${tab === id ? 'btn-primary' : ''}`} onClick={() => changeTab(id)}>{label}</button>
          ))}
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input className="input max-w-64" placeholder="Buscar por nome ou efeito" aria-label="Buscar no catálogo" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="min-w-48">
          <Select label="Seção" value={section || 'all'} options={[{ value: 'all', label: 'Todas as seções' }, ...sections.map((value) => ({ value, label: value }))]} onChange={(value) => setSection(value === 'all' ? '' : value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyAllowed} onChange={(event) => setOnlyAllowed(event.target.checked)} />
          Só permitidos na criação
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <ul className="max-h-[32rem] space-y-1 overflow-y-auto pr-1" aria-label="Itens do catálogo">
          {!visible.length && <Empty>Nada encontrado.</Empty>}
          {visible.map((entry) => {
            const stats = entryStats(entry, entryRating(entry));
            const blocked = stats.availability > derived.level.maxAvailability;
            return (
              <li key={entry.id}>
                <button type="button" aria-pressed={selectedId === entry.id} className={`flex w-full cursor-pointer items-baseline justify-between gap-3 border px-2 py-1 text-left ${selectedId === entry.id ? 'border-accent bg-accent/10' : 'border-line hover:border-mute'}`} onClick={() => setSelectedId(entry.id)}>
                  <span className="min-w-0">
                    <span className={blocked ? 'text-mute' : ''}>{entry.name}</span>
                    <span className="block truncate text-sm text-mute">{entry.desc}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-xs">
                    <span className="block text-amber">{costText(entry)}</span>
                    <span className={blocked ? 'text-alert' : 'text-mute'}>Disp. {availText(stats.availability, stats.restriction)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="cut-sm border border-line bg-panel-2 p-3 lg:sticky lg:top-4 lg:self-start">
          {selected ? <EntryDetail key={selected.id} entry={selected} target={target} onDone={() => setSelectedId('')} /> : <Empty>Escolha um item para ver o que ele faz.</Empty>}
        </div>
      </div>
    </Panel>
  );
}
