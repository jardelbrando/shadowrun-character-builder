import { motion } from 'motion/react';
import {
  ATTRIBUTE_NAMES,
  AWAKENING_NAMES,
  CORE_ATTRIBUTES,
  PRIORITY_COLUMNS,
  PRIORITY_LEVELS,
  metatypes,
  priorities,
  type AwakeningType,
  type PriorityColumn,
  type PriorityLevel,
} from '../data';
import { attributeMax, edgeMax, isAwakened, isTechnomancer, resourcesFor, specialMax } from '../engine/derive';
import { useCharacter } from '../store';
import { Choice, Meter, Panel, Stepper, formatNuyen } from '../ui/primitives';

const COLUMN_NAMES: Record<PriorityColumn, string> = {
  metatype: 'Meta-tipo',
  attributes: 'Atributos',
  magicResonance: 'Magia/Ressonância',
  skills: 'Perícias',
  resources: 'Recursos',
};

export function PrioritiesStep() {
  const { character, edit, derived } = useCharacter();

  const describe = (column: PriorityColumn, level: PriorityLevel) => {
    const row = priorities[level];
    switch (column) {
      case 'metatype':
        return Object.entries(row.metatypes)
          .map(([id, points]) => `${metatypes.find((m) => m.id === id)?.name} (${points})`)
          .join(', ');
      case 'attributes':
        return `${row.attributes} pontos`;
      case 'magicResonance': {
        const types = Object.keys(row.magic) as AwakeningType[];
        return types.length ? types.map((type) => AWAKENING_NAMES[type]).join(', ') : 'Mundano';
      }
      case 'skills':
        return `${row.skills.points}/${row.skills.groups}`;
      case 'resources':
        return formatNuyen(resourcesFor(character, level));
    }
  };

  // Escolher um nível já usado troca as duas colunas, sem deixar lacunas.
  const assign = (column: PriorityColumn, level: PriorityLevel) =>
    edit((c) => {
      const holder = PRIORITY_COLUMNS.find((other) => other !== column && c.priorities[other] === level);
      if (holder) c.priorities[holder] = c.priorities[column];
      c.priorities[column] = level;
    });

  const available = character.priorities.metatype ? priorities[character.priorities.metatype].metatypes : null;

  return (
    <div className="space-y-4">
      <Panel title="Tabela de Prioridade">
        <div className="overflow-x-auto">
          <div className="grid min-w-[46rem] grid-cols-[2.5rem_repeat(5,1fr)] gap-1">
            <div />
            {PRIORITY_COLUMNS.map((column) => (
              <div key={column} className="label px-1 pb-1">
                {COLUMN_NAMES[column]}
              </div>
            ))}
            {PRIORITY_LEVELS.map((level) => (
              <div key={level} className="contents">
                <div className="flex items-center justify-center font-display text-xl font-bold text-magenta">{level}</div>
                {PRIORITY_COLUMNS.map((column) => {
                  const selected = character.priorities[column] === level;
                  return (
                    <button
                      key={column}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => assign(column, level)}
                      className="relative min-h-16 cursor-pointer border border-line bg-panel-2 p-2 text-left text-sm hover:border-mute"
                    >
                      {selected && <motion.span layoutId={`priority-${column}`} className="absolute inset-0 border-2 border-cyan bg-cyan/10 shadow-[0_0_16px_rgb(34_230_255/0.35)]" />}
                      <span className="relative">{describe(column, level)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Meta-tipo">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {metatypes.map((metatype) => {
            const points = available?.[metatype.id];
            return (
              <Choice key={metatype.id} selected={character.metatype === metatype.id} disabled={!available || points === undefined} onClick={() => edit((c) => void (c.metatype = metatype.id))}>
                <div className="font-display text-sm font-bold">{metatype.name}</div>
                <div className="font-mono text-xs text-mute">{points === undefined ? 'Indisponível' : `${points} pts. especiais`}</div>
                <div className="mt-1 text-sm text-mute">{metatype.racial.join(' · ') || 'Sem bônus racial; Trunfo maior'}</div>
              </Choice>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Atributos" aside={<div className="w-44"><Meter label="Pontos" spent={derived.points.attributes.spent} pool={derived.points.attributes.pool} /></div>}>
          <ul className="space-y-1">
            {CORE_ATTRIBUTES.map((key) => (
              <li key={key} className="flex items-center justify-between gap-2">
                <span>{ATTRIBUTE_NAMES[key]}</span>
                <span className="ml-auto font-mono text-sm text-mute">
                  {derived.natural[key]} / {attributeMax(character, key)}
                </span>
                <Stepper label={ATTRIBUTE_NAMES[key]} value={character.attributes[key].points} max={attributeMax(character, key) - (derived.natural[key] - character.attributes[key].points)} onChange={(value) => edit((c) => void (c.attributes[key].points = value))} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Atributos especiais" aside={<div className="w-44"><Meter label="Pontos" spent={derived.points.special.spent} pool={derived.points.special.pool} /></div>}>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span>Trunfo</span>
              <span className="ml-auto font-mono text-sm text-mute">
                {derived.edge} / {edgeMax(character)}
              </span>
              <Stepper label="Trunfo" value={character.special.edge.points} max={edgeMax(character) - derived.edge + character.special.edge.points} onChange={(value) => edit((c) => void (c.special.edge.points = value))} />
            </li>
            {isAwakened(character) && (
              <li className="flex items-center gap-2">
                <span>Magia</span>
                <span className="ml-auto font-mono text-sm text-mute">
                  {derived.magicNatural} / {specialMax(character, 'magic')}
                </span>
                <Stepper label="Magia" value={character.special.magic.points} onChange={(value) => edit((c) => void (c.special.magic.points = value))} />
              </li>
            )}
            {isTechnomancer(character) && (
              <li className="flex items-center gap-2">
                <span>Ressonância</span>
                <span className="ml-auto font-mono text-sm text-mute">
                  {derived.resonanceNatural} / {specialMax(character, 'resonance')}
                </span>
                <Stepper label="Ressonância" value={character.special.resonance.points} onChange={(value) => edit((c) => void (c.special.resonance.points = value))} />
              </li>
            )}
          </ul>
          <p className="mt-3 text-sm text-mute">Pontos especiais vão para Trunfo, Magia ou Ressonância. Magia e Ressonância aparecem aqui depois da escolha na próxima etapa.</p>
        </Panel>
      </div>
    </div>
  );
}
