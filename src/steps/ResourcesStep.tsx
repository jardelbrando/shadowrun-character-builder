import { useState } from 'react';
import { lifestyles, programs } from '../data';
import { gearItemSchema, type GearItem } from '../schema/character';
import { newId, useCharacter } from '../store';
import { Choice, Field, NumberField, Panel, Stepper, formatNuyen } from '../ui/primitives';
import { AugmentationSummary } from './AugmentationSummary';
import { CatalogBrowser, type CatalogTab } from './CatalogBrowser';
import { OwnedGear } from './OwnedGear';

const GEAR_TABS: CatalogTab[] = [
  { id: 'weapons', label: 'Armas' },
  { id: 'accessories', label: 'Acessórios' },
  { id: 'ammo', label: 'Munição e explosivos' },
  { id: 'armor', label: 'Armaduras' },
  { id: 'electronics', label: 'Eletrônicos' },
  { id: 'tools', label: 'Ferramentas' },
  { id: 'magic', label: 'Magia' },
  { id: 'vehicles', label: 'Veículos' },
];

const AUGMENTATION_TABS: CatalogTab[] = [
  { id: 'cyber', label: 'Ciber-itens' },
  { id: 'bio', label: 'Biônicos' },
];

const SECTIONS = [
  { id: 'gear', label: 'Equipamentos' },
  { id: 'augmentations', label: 'Ampliações' },
  { id: 'lifestyle', label: 'Estilo de vida' },
  { id: 'programs', label: 'Programas' },
] as const;

export function ResourcesStep() {
  const { character, edit, derived } = useCharacter();
  const { level, nuyen } = derived;
  const [section, setSection] = useState<(typeof SECTIONS)[number]['id']>('gear');
  const [targetId, setTargetId] = useState('');
  const target = character.gear.find((item) => item.id === targetId);

  const rollDice = () => {
    const dice = nuyen.lifestyle.dice;
    let total = 0;
    for (let i = 0; i < dice; i++) total += 1 + Math.floor(Math.random() * 6);
    edit((c) => void (c.lifestyle.startingRoll = total));
  };

  const install = (item: GearItem) => {
    setTargetId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeSection = (id: (typeof SECTIONS)[number]['id']) => {
    setSection(id);
    setTargetId('');
  };

  return (
    <div className="space-y-4">
      <Panel title="Fundos" term="stat:nuyen">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <div className="label">Disponível</div>
            <div className="font-mono text-lg">{formatNuyen(nuyen.total)}</div>
          </div>
          <div>
            <div className="label">Gasto</div>
            <div className="font-mono text-lg">{formatNuyen(nuyen.spent)}</div>
          </div>
          <div>
            <div className="label">Restante</div>
            <div className={`font-mono text-lg ${nuyen.remaining < 0 ? 'text-alert' : 'text-acid'}`}>{formatNuyen(nuyen.remaining)}</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="label">Carma em neoienes (2.000¥ cada)</span>
            <Stepper label="Carma convertido" value={character.karmaToNuyen} max={level.maxKarmaToNuyen} onChange={(value) => edit((c) => void (c.karmaToNuyen = value))} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-2 sm:grid-cols-4" role="group" aria-label="Seções de recursos">
        {SECTIONS.map(({ id, label }) => (
          <Choice key={id} selected={section === id} onClick={() => changeSection(id)}>
            <span className="font-display text-xs font-bold uppercase">{label}</span>
          </Choice>
        ))}
      </div>

      {section === 'gear' && (
        <>
          <CatalogBrowser key="gear" tabs={GEAR_TABS} target={target} onCancelTarget={() => setTargetId('')} />
          <OwnedGear
            title="Comprados"
            augmented={false}
            onInstall={install}
            aside={<button type="button" className="btn" onClick={() => edit((c) => void c.gear.push(gearItemSchema.parse({ id: newId() })))}>+ Item personalizado</button>}
          />
        </>
      )}

      {section === 'augmentations' && (
        <>
          <AugmentationSummary />
          <CatalogBrowser key="augmentations" tabs={AUGMENTATION_TABS} target={target} onCancelTarget={() => setTargetId('')} />
          <OwnedGear title="Ampliações instaladas" augmented onInstall={install} />
        </>
      )}

      {section === 'lifestyle' && (
        <Panel title="Estilo de vida" term="gear:lifestyle">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {lifestyles.map((lifestyle) => (
              <Choice key={lifestyle.id} selected={character.lifestyle.id === lifestyle.id} onClick={() => edit((c) => void (c.lifestyle.id = lifestyle.id))}>
                <div className="font-display text-xs font-bold">{lifestyle.name}</div>
                <div className="font-mono text-xs text-mute">{lifestyle.cost ? `${formatNuyen(lifestyle.cost)}/mês` : 'Grátis'}</div>
              </Choice>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <Field label="Meses">
              <Stepper label="Meses" value={character.lifestyle.months} min={1} onChange={(value) => edit((c) => void (c.lifestyle.months = value))} />
            </Field>
            <NumberField className="w-32" label={`${nuyen.lifestyle.dice}D6`} value={character.lifestyle.startingRoll} onChange={(value) => edit((c) => void (c.lifestyle.startingRoll = value))} />
            <button type="button" className="btn btn-primary" onClick={rollDice}>Rolar</button>
            <div className="ml-auto text-right">
              <div className="label">Neoienes iniciais</div>
              <div className="font-mono text-lg text-accent">
                {formatNuyen(nuyen.starting)} <span className="text-xs text-mute">({nuyen.lifestyle.dice}D6 x {nuyen.lifestyle.multiplier} + {formatNuyen(nuyen.carried)})</span>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {section === 'programs' && (
        <Panel title="Programas" term="gear:programs" aside={<span className="font-mono text-sm text-mute">{formatNuyen(nuyen.programCost)}</span>}>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => {
              const selected = character.programs.includes(program.id);
              return (
                <li key={program.id}>
                  <button type="button" aria-pressed={selected} className={`flex w-full cursor-pointer justify-between gap-2 border px-2 py-1 text-left ${selected ? 'border-accent bg-accent/10' : 'border-line hover:border-mute'}`} onClick={() => edit((c) => void (c.programs = selected ? c.programs.filter((id) => id !== program.id) : [...c.programs, program.id]))}>
                    <span>{program.name}</span>
                    <span className="font-mono text-xs text-mute">{program.kind === 'hacking' ? 'Hackear' : 'Comum'} · {program.cost}¥</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
