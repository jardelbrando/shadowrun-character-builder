import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ATTRIBUTE_NAMES, CORE_ATTRIBUTES } from '../data';
import { derive, isAwakened, isTechnomancer } from '../engine/derive';
import { useCharacter } from '../store';
import { Panel } from '../ui/primitives';
import { Term } from '../ui/Term';

interface Row {
  term: string;
  label: string;
  before: string | number;
  after: string | number;
}

function Line({ term, label, before, after }: Row) {
  const changed = before !== after;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line/60 py-0.5">
      <span className={changed ? '' : 'text-mute'}><Term id={term}>{label}</Term></span>
      <span className="font-mono text-sm">
        {changed && <><span className="text-mute">{before}</span><span aria-hidden="true" className="text-accent"> ▸ </span></>}
        <motion.span key={String(after)} initial={{ color: '#ff3131' }} animate={{ color: changed ? '#b6ff2e' : '#f2e9e6' }}>{after}</motion.span>
      </span>
    </div>
  );
}

/** Compara o personagem sem ampliações com o personagem atual. */
export function AugmentationSummary() {
  const { character, derived: after } = useCharacter();
  const before = useMemo(
    () => derive({ ...character, gear: character.gear.filter((item) => !item.augType && !(item.parentId && character.gear.find((p) => p.id === item.parentId)?.augType)) }),
    [character],
  );
  const initiative = (d: typeof after) => `${d.initiative.value} + ${d.initiative.dice}D6`;
  const limit = (d: typeof after, key: keyof typeof after.limits) => d.limits[key] + d.limitBonus[key];

  const left: Row[] = [
    { term: 'attr:essence', label: 'Essência', before: before.essence.toFixed(2), after: after.essence.toFixed(2) },
    ...(isAwakened(character) ? [{ term: 'attr:magic', label: 'Magia', before: before.magic, after: after.magic }] : []),
    ...(isTechnomancer(character) ? [{ term: 'attr:resonance', label: 'Ressonância', before: before.resonance, after: after.resonance }] : []),
    ...CORE_ATTRIBUTES.map((key) => ({ term: `attr:${key}`, label: ATTRIBUTE_NAMES[key], before: before.augmented[key], after: after.augmented[key] })),
  ];
  const right: Row[] = [
    { term: 'stat:initiative', label: 'Iniciativa', before: initiative(before), after: initiative(after) },
    { term: 'stat:limit-physical', label: 'Limite Físico', before: limit(before, 'physical'), after: limit(after, 'physical') },
    { term: 'stat:limit-mental', label: 'Limite Mental', before: limit(before, 'mental'), after: limit(after, 'mental') },
    { term: 'stat:limit-social', label: 'Limite Social', before: limit(before, 'social'), after: limit(after, 'social') },
    { term: 'stat:monitor-physical', label: 'Monitor Físico', before: before.monitors.physical, after: after.monitors.physical },
    { term: 'stat:monitor-stun', label: 'Monitor de Atordoamento', before: before.monitors.stun, after: after.monitors.stun },
    { term: 'stat:overflow', label: 'Caixas em Excesso', before: before.monitors.overflow, after: after.monitors.overflow },
    { term: 'stat:armor', label: 'Armadura', before: before.armor, after: after.armor },
    { term: 'stat:composure', label: 'Compostura', before: before.composure, after: after.composure },
    { term: 'stat:memory', label: 'Memória', before: before.memory, after: after.memory },
  ];

  return (
    <Panel title="Novos cálculos" aside={<span className="text-sm text-mute">Sem ampliações ▸ com ampliações</span>}>
      <div className="grid gap-x-8 md:grid-cols-2">
        <div>{left.map((row) => <Line key={row.label} {...row} />)}</div>
        <div>{right.map((row) => <Line key={row.label} {...row} />)}</div>
      </div>
      {after.essencePenalty > 0 && (isAwakened(character) || isTechnomancer(character)) && (
        <p className="mt-2 text-sm text-amber">
          Cada fração de Essência perdida reduz {isTechnomancer(character) ? 'a Ressonância' : 'a Magia'} em 1. Perda atual: {after.essencePenalty}.
        </p>
      )}
    </Panel>
  );
}
