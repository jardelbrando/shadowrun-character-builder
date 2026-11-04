import { CORE_ATTRIBUTES, ATTRIBUTE_NAMES, gearCategories, grades, lifestyles, programs, type CoreAttribute } from '../data';
import { Term } from '../ui/Term';
import { gearItemSchema, type GearItem } from '../schema/character';
import { gearTotals } from '../engine/derive';
import { newId, useCharacter } from '../store';
import { Choice, Empty, Field, NumberField, Panel, Select, Stepper, TextField, formatNuyen } from '../ui/primitives';

export function ResourcesStep() {
  const { character, edit, derived } = useCharacter();
  const { level, nuyen } = derived;

  const rollDice = () => {
    const dice = nuyen.lifestyle.dice;
    let total = 0;
    for (let i = 0; i < dice; i++) total += 1 + Math.floor(Math.random() * 6);
    edit((c) => void (c.lifestyle.startingRoll = total));
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

      <Panel title="Equipamentos e ampliações" aside={<button type="button" className="btn" onClick={() => edit((c) => void c.gear.push(gearItemSchema.parse({ id: newId() })))}>+ Adicionar</button>}>
        <p className="mb-3 text-sm text-mute">
          Limites deste nível: Disponibilidade {level.maxAvailability}, Nível de Dispositivo {level.maxDeviceRating}. Ampliações só podem ser Padrão ou Alphaware.
        </p>
        {!character.gear.length && <Empty>Preencha cada item com os valores do livro.</Empty>}
        <ul className="space-y-3">
          {character.gear.map((item, index) => (
            <GearRow key={item.id} item={item} index={index} />
          ))}
        </ul>
      </Panel>

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
    </div>
  );
}

function GearRow({ item, index }: { item: GearItem; index: number }) {
  const { edit } = useCharacter();
  const change = (recipe: (g: GearItem) => void) => edit((c) => recipe(c.gear[index]));
  const totals = gearTotals(item);
  return (
    <li className="cut-sm border border-line bg-panel-2 p-3">
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
        <TextField label="Item" value={item.name} onChange={(value) => change((g) => void (g.name = value))} />
        <Field label="Categoria">
          <Select label="Categoria" value={item.category} options={gearCategories.map((value) => ({ value, label: value }))} onChange={(value) => change((g) => void (g.category = value))} />
        </Field>
        <button type="button" className="btn btn-danger self-end" aria-label={`Remover ${item.name || 'item'}`} onClick={() => edit((c) => void c.gear.splice(index, 1))}>✕</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        <NumberField label="Qtd." min={1} value={item.quantity} onChange={(value) => change((g) => void (g.quantity = value))} />
        <NumberField label="Custo ¥" value={item.unitCost} onChange={(value) => change((g) => void (g.unitCost = value))} />
        <NumberField label="Disp." term="gear:availability" value={item.availability} onChange={(value) => change((g) => void (g.availability = value))} />
        <Field label="R/P" term="gear:restriction">
          <Select label="Restrição" value={item.restriction || 'none'} options={[{ value: 'none', label: '—' }, { value: 'R', label: 'R' }, { value: 'P', label: 'P' }]} onChange={(value) => change((g) => void (g.restriction = value === 'none' ? '' : (value as 'R' | 'P')))} />
        </Field>
        <NumberField label="Nível disp." term="gear:deviceRating" value={item.deviceRating} onChange={(value) => change((g) => void (g.deviceRating = value))} />
        <NumberField label="Armadura" term="stat:armor" value={item.armor} onChange={(value) => change((g) => void (g.armor = value))} />
        <NumberField label="Essência" term="gear:essence" step={0.05} value={item.essence} onChange={(value) => change((g) => void (g.essence = value))} />
        <NumberField label="+ Dados Inic." term="stat:initiative" value={item.initiativeDice} onChange={(value) => change((g) => void (g.initiativeDice = value))} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-2">
          {CORE_ATTRIBUTES.map((key: CoreAttribute) => (
            <label key={key} className="flex items-center gap-1 text-sm">
              <span className="text-mute"><Term id="gear:bonus" plain>{ATTRIBUTE_NAMES[key].slice(0, 3)}</Term></span>
              <input className="input w-12! px-1! py-0!  font-mono" type="number" aria-label={`Bônus de ${ATTRIBUTE_NAMES[key]}`} value={item.attributeBonuses[key] ?? 0} onChange={(event) => change((g) => void (g.attributeBonuses[key] = Number(event.target.value) || 0))} />
            </label>
          ))}
        </div>
        <div className="w-40">
          <p className="label mb-1"><Term id="gear:grade">Classe</Term></p>
          <Select label="Classe" value={item.grade} options={grades.map((g) => ({ value: g.id, label: g.name }))} onChange={(value) => change((g) => void (g.grade = value as GearItem['grade']))} />
        </div>
      </div>
      <p className="mt-2 font-mono text-xs text-mute">Total: {formatNuyen(totals.cost)} · Disp. {totals.availability}{item.restriction} · Ess. {totals.essence.toFixed(2)}</p>
    </li>
  );
}
