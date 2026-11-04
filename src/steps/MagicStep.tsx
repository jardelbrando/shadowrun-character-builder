import { useState } from 'react';
import {
  AWAKENING_NAMES,
  AWAKENING_TYPES,
  LIMIT_NAMES,
  PHYSICAL_ATTRIBUTES,
  ATTRIBUTE_NAMES,
  SPELL_CATEGORY_NAMES,
  adeptPowers,
  byId,
  complexForms,
  magicData,
  priorities,
  skillGroups,
  skills,
  spells,
} from '../data';
import { adeptPowerCost, isAdept, isCaster, isTechnomancer } from '../engine/derive';
import { newId, useCharacter } from '../store';
import { Choice, Empty, Field, Meter, Panel, Select, Stepper, TextField } from '../ui/primitives';

export function MagicStep() {
  const { character, edit, derived } = useCharacter();
  const level = character.priorities.magicResonance;
  const row = level ? priorities[level].magic : {};
  const option = derived.option;
  const [spellFilter, setSpellFilter] = useState('');

  const freeChoices = skills.filter((skill) => {
    const kind = option?.skills?.kind;
    if (kind === 'magic') return skill.restricted === 'magic';
    if (kind === 'resonance') return skill.restricted === 'resonance';
    return !skill.restricted;
  });

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);

  return (
    <div className="space-y-4">
      {!level && <Panel><Empty>Escolha a prioridade de Magia ou Ressonância na etapa anterior.</Empty></Panel>}
      <Panel title="Caminho">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {AWAKENING_TYPES.map((type) => {
            const available = type === 'none' || row[type] !== undefined;
            const grant = row[type];
            return (
              <Choice key={type} selected={character.awakening.type === type} disabled={!available} onClick={() => edit((c) => void (c.awakening.type = type))}>
                <div className="font-display text-xs font-bold">{AWAKENING_NAMES[type]}</div>
                {grant && <div className="font-mono text-xs text-mute">{grant.magic ? `Magia ${grant.magic}` : `Ressonância ${grant.resonance}`}</div>}
              </Choice>
            );
          })}
        </div>
      </Panel>

      {option?.skills && (
        <Panel title={`Perícias gratuitas (${option.skills.count} em nível ${option.skills.rating})`}>
          <div className="flex flex-wrap gap-2">
            {freeChoices.map((skill) => {
              const selected = character.awakening.freeSkills.includes(skill.id);
              const full = character.awakening.freeSkills.length >= option.skills!.count;
              return (
                <button key={skill.id} type="button" aria-pressed={selected} disabled={!selected && full} className={`btn ${selected ? 'btn-primary' : ''}`} onClick={() => edit((c) => void (c.awakening.freeSkills = toggle(c.awakening.freeSkills, skill.id)))}>
                  {skill.name}
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {character.awakening.type === 'aspected' && (
        <Panel title={`Grupo de perícias${option?.skillGroup ? ` em nível ${option.skillGroup.rating}` : ''}`}>
          <div className="grid gap-2 sm:grid-cols-3">
            {magicData.aspectedGroups.map((id) => {
              const group = byId(skillGroups, id)!;
              return (
                <Choice key={id} selected={character.awakening.freeSkillGroup === id} onClick={() => edit((c) => void (c.awakening.freeSkillGroup = id))}>
                  <div className="font-display text-sm font-bold">{group.name}</div>
                  <div className="text-sm text-mute">{group.skills.map((skill) => byId(skills, skill)?.name).join(', ')}</div>
                </Choice>
              );
            })}
          </div>
        </Panel>
      )}

      {(isCaster(character) || isAdept(character)) && (
        <Panel title="Tradição e mentor">
          <div className="grid gap-3 sm:grid-cols-2">
            {isCaster(character) && (
              <Field label="Tradição">
                <Select label="Tradição" value={character.awakening.tradition} options={magicData.traditions.map((t) => ({ value: t.id, label: t.name }))} onChange={(value) => edit((c) => void (c.awakening.tradition = value))} />
              </Field>
            )}
            <Field label="Espírito mentor">
              <Select label="Espírito mentor" value={character.awakening.mentorSpirit} options={magicData.mentorSpirits.map((m) => ({ value: m.id, label: m.name }))} onChange={(value) => edit((c) => void (c.awakening.mentorSpirit = value))} />
            </Field>
          </div>
          <p className="mt-2 text-sm text-mute">O mentor só vale com a qualidade Espírito Mentor (Etapa 4).</p>
        </Panel>
      )}

      {isCaster(character) && (
        <Panel title="Feitiços" aside={<span className="font-mono text-sm text-mute">{character.spells.length} escolhidos · {derived.freeSpells} grátis · máx. {derived.magicNatural * 2}</span>}>
          <input className="input mb-3" placeholder="Buscar feitiço" aria-label="Buscar feitiço" value={spellFilter} onChange={(event) => setSpellFilter(event.target.value)} />
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {Object.entries(SPELL_CATEGORY_NAMES).map(([category, name]) => {
              const list = spells.filter((spell) => spell.category === category && spell.name.toLowerCase().includes(spellFilter.toLowerCase()));
              if (!list.length) return null;
              return (
                <div key={category}>
                  <h4 className="label mb-1">{name}</h4>
                  <ul className="grid gap-1 md:grid-cols-2">
                    {list.map((spell) => {
                      const selected = character.spells.includes(spell.id);
                      return (
                        <li key={spell.id}>
                          <button type="button" aria-pressed={selected} className={`flex w-full cursor-pointer items-center justify-between gap-2 border px-2 py-1 text-left ${selected ? 'border-cyan bg-cyan/10' : 'border-line hover:border-mute'}`} onClick={() => edit((c) => void (c.spells = toggle(c.spells, spell.id)))}>
                            <span>{spell.name}</span>
                            <span className="font-mono text-xs whitespace-nowrap text-mute">
                              {spell.type} · {spell.range} · {spell.duration} · {spell.drain}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {isCaster(character) && (
        <Panel title="Rituais e preparativos" aside={<button type="button" className="btn" onClick={() => edit((c) => void c.formulae.push({ id: newId(), kind: 'ritual', name: '' }))}>+ Adicionar</button>}>
          {!character.formulae.length && <Empty>Cada fórmula custa 5 de Carma.</Empty>}
          <ul className="space-y-2">
            {character.formulae.map((formula, index) => (
              <li key={formula.id} className="grid grid-cols-[1fr_11rem_auto] items-end gap-2">
                <TextField label="Nome" value={formula.name} onChange={(value) => edit((c) => void (c.formulae[index].name = value))} />
                <Select label="Tipo" value={formula.kind} options={[{ value: 'ritual', label: 'Ritual' }, { value: 'preparation', label: 'Preparativo' }]} onChange={(value) => edit((c) => void (c.formulae[index].kind = value as 'ritual' | 'preparation'))} />
                <button type="button" className="btn btn-danger" aria-label="Remover fórmula" onClick={() => edit((c) => void c.formulae.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {isTechnomancer(character) && (
        <Panel title="Formas complexas" aside={<span className="font-mono text-sm text-mute">{character.complexForms.length} escolhidas · {derived.freeComplexForms} grátis · máx. {derived.natural.logic}</span>}>
          <ul className="grid gap-1 md:grid-cols-2">
            {complexForms.map((form) => {
              const selected = character.complexForms.includes(form.id);
              return (
                <li key={form.id}>
                  <button type="button" aria-pressed={selected} className={`flex w-full cursor-pointer items-center justify-between gap-2 border px-2 py-1 text-left ${selected ? 'border-cyan bg-cyan/10' : 'border-line hover:border-mute'}`} onClick={() => edit((c) => void (c.complexForms = toggle(c.complexForms, form.id)))}>
                    <span>{form.name}</span>
                    <span className="font-mono text-xs whitespace-nowrap text-mute">
                      {form.target} · {form.duration} · VE {form.fade}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {isAdept(character) && (
        <Panel title="Poderes de adepto" aside={<div className="w-48"><Meter label="Pontos de Poder" spent={derived.points.powerPoints.spent} pool={derived.points.powerPoints.pool} /></div>}>
          {character.awakening.type === 'mysticAdept' && (
            <div className="mb-3 flex items-center gap-3">
              <span className="label">Comprados com Carma (5 cada)</span>
              <Stepper label="Pontos de Poder comprados" value={character.awakening.powerPointsBought} max={derived.magicNatural} onChange={(value) => edit((c) => void (c.awakening.powerPointsBought = value))} />
            </div>
          )}
          <ul className="grid gap-1 md:grid-cols-2">
            {adeptPowers.map((power) => {
              const index = character.adeptPowers.findIndex((p) => p.id === power.id);
              const entry = character.adeptPowers[index];
              const rated = power.perRating || power.costByRating;
              return (
                <li key={power.id} className={`border px-2 py-1 ${entry ? 'border-cyan bg-cyan/10' : 'border-line'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" aria-pressed={!!entry} className="flex-1 cursor-pointer text-left" onClick={() => edit((c) => {
                      if (entry) c.adeptPowers.splice(index, 1);
                      else c.adeptPowers.push({ id: power.id, rating: 1, choice: '' });
                    })}>
                      {power.name}
                    </button>
                    <span className="font-mono text-xs text-mute">{adeptPowerCost(power.id, entry?.rating ?? 1)} PP</span>
                  </div>
                  {entry && rated && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="label">Nível</span>
                      <Stepper label={`Nível de ${power.name}`} value={entry.rating} min={1} max={power.maxRating ?? 12} onChange={(value) => edit((c) => void (c.adeptPowers[index].rating = value))} />
                    </div>
                  )}
                  {entry && power.choice && (
                    <div className="mt-1">
                      {power.choice === 'skill' ? (
                        <input className="input" placeholder="Perícia" aria-label={`Perícia de ${power.name}`} value={entry.choice} onChange={(event) => edit((c) => void (c.adeptPowers[index].choice = event.target.value))} />
                      ) : (
                        <Select
                          label={`Escolha de ${power.name}`}
                          value={entry.choice}
                          options={
                            power.choice === 'limit'
                              ? Object.entries(LIMIT_NAMES).map(([value, label]) => ({ value, label }))
                              : PHYSICAL_ATTRIBUTES.map((value) => ({ value, label: ATTRIBUTE_NAMES[value] }))
                          }
                          onChange={(value) => edit((c) => void (c.adeptPowers[index].choice = value))}
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
