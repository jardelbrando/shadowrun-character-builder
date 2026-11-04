import { useState } from 'react';
import { Term } from '../ui/Term';
import { ATTRIBUTE_NAMES, byId, knowledgeCategories, skillGroups, skills } from '../data';
import { freeSkillRating, skillGroupRating, skillMax, skillRating } from '../engine/derive';
import { newId, useCharacter } from '../store';
import { FreeSkillPicker } from './FreeSkillPicker';
import { Empty, Meter, Panel, Select, Stepper, TextField } from '../ui/primitives';

const ATTRIBUTE_ORDER = ['agility', 'body', 'reaction', 'strength', 'charisma', 'intuition', 'logic', 'willpower', 'magic', 'resonance'];

export function SkillsStep() {
  const { character, edit, derived } = useCharacter();
  const [filter, setFilter] = useState('');
  const coveredByGroup = (id: string) => skillGroups.find((group) => group.skills.includes(id) && skillGroupRating(character, group.id) > 0);

  const setSkill = (id: string, patch: { points?: number; specialization?: string }) =>
    edit((c) => {
      const current = c.skills[id] ?? { points: 0, karmaRanks: 0, specialization: '', specBy: 'points' as const };
      c.skills[id] = { ...current, ...patch };
    });

  return (
    <div className="space-y-4">
      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <Meter label="Perícias" term="concept:skills" spent={derived.points.skills.spent} pool={derived.points.skills.pool} />
          <Meter label="Grupos" term="concept:groups" spent={derived.points.groups.spent} pool={derived.points.groups.pool} />
          <Meter label="Conhecimento e Idioma" term="concept:knowledge" spent={derived.points.knowledge.spent} pool={derived.points.knowledge.pool} />
        </div>
      </Panel>

      <FreeSkillPicker />

      <Panel title="Grupos de perícias" term="concept:groups">
        <ul className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          {skillGroups.map((group) => {
            const free = skillGroupRating(character, group.id) - (character.skillGroups[group.id]?.points ?? 0) - (character.skillGroups[group.id]?.karmaRanks ?? 0);
            return (
              <li key={group.id} className="flex items-center justify-between gap-2">
                <span>
                  <Term id={`group:${group.id}`}>{group.name}</Term>
                  <span className="ml-2 text-sm text-mute">{group.skills.map((id) => byId(skills, id)?.name).join(', ')}</span>
                  {free > 0 && <span className="ml-2 font-mono text-xs text-acid">+{free} grátis</span>}
                </span>
                <Stepper label={`Grupo ${group.name}`} value={character.skillGroups[group.id]?.points ?? 0} max={6} onChange={(value) => edit((c) => {
                  const current = c.skillGroups[group.id] ?? { points: 0, karmaRanks: 0 };
                  c.skillGroups[group.id] = { ...current, points: value };
                })} />
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Perícias Ativas" term="concept:skills" aside={<input className="input max-w-60" placeholder="Buscar perícia" aria-label="Buscar perícia" value={filter} onChange={(event) => setFilter(event.target.value)} />}>
        <p className="mb-2 text-sm text-mute">Passe o mouse nos termos sublinhados para ver a explicação. Uma <Term id="concept:specialization">especialização</Term> custa 1 ponto.</p>
        <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          {ATTRIBUTE_ORDER.map((attribute) => {
            const list = skills.filter((skill) => skill.attribute === attribute && skill.name.toLowerCase().includes(filter.toLowerCase()));
            if (!list.length) return null;
            return (
              <div key={attribute}>
                <h4 className="label mb-1"><Term id={`attr:${attribute}`}>{ATTRIBUTE_NAMES[attribute]}</Term></h4>
                <ul className="grid gap-x-6 gap-y-1 lg:grid-cols-2">
                  {list.map((skill) => {
                    const entry = character.skills[skill.id];
                    const group = coveredByGroup(skill.id);
                    const free = freeSkillRating(character, skill.id);
                    return (
                      <li key={skill.id} className="flex items-center gap-2">
                        <Term id={`skill:${skill.id}`} className={group ? 'text-mute' : ''}>{skill.name}</Term>
                        {group && <span className="font-mono text-xs text-mute">({group.name})</span>}
                        {free > 0 && <span className="font-mono text-xs text-acid">+{free} grátis</span>}
                        <span className="ml-auto" />
                        {(entry?.points ?? 0) + free > 0 && (
                          <input className="input max-w-32 py-0.5!" placeholder="Especialização" aria-label={`Especialização de ${skill.name}`} value={entry?.specialization ?? ''} onChange={(event) => setSkill(skill.id, { specialization: event.target.value })} />
                        )}
                        <span className="w-5 text-right font-mono text-sm text-accent">{skillRating(character, skill.id) || ''}</span>
                        <Stepper label={skill.name} value={entry?.points ?? 0} max={Math.max(entry?.points ?? 0, skillMax(character, skill.id) - free)} onChange={(value) => setSkill(skill.id, { points: value })} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Conhecimento" term="concept:knowledge" aside={<button type="button" className="btn" onClick={() => edit((c) => void c.knowledge.push({ id: newId(), name: '', category: 'street', points: 1, karmaRanks: 0, specialization: '', specBy: 'points' }))}>+ Adicionar</button>}>
          {!character.knowledge.length && <Empty>Pontos gratuitos: (Intuição + Lógica) x 2.</Empty>}
          <ul className="space-y-2">
            {character.knowledge.map((entry, index) => (
              <li key={entry.id} className="grid grid-cols-[1fr_8.5rem_auto_auto] items-end gap-2">
                <TextField label="Nome" value={entry.name} onChange={(value) => edit((c) => void (c.knowledge[index].name = value))} />
                <Select label="Categoria" value={entry.category} options={knowledgeCategories.map((k) => ({ value: k.id, label: k.name }))} onChange={(value) => edit((c) => void (c.knowledge[index].category = value as typeof entry.category))} />
                <Stepper label={`Nível de ${entry.name || 'conhecimento'}`} value={entry.points} max={6} onChange={(value) => edit((c) => void (c.knowledge[index].points = value))} />
                <button type="button" className="btn btn-danger px-2!" aria-label="Remover conhecimento" onClick={() => edit((c) => void c.knowledge.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Idiomas" term="concept:languages" aside={<button type="button" className="btn" onClick={() => edit((c) => void c.languages.push({ id: newId(), name: '', native: c.languages.length === 0, points: c.languages.length === 0 ? 0 : 1, karmaRanks: 0, specialization: '', specBy: 'points' }))}>+ Adicionar</button>}>
          {!character.languages.length && <Empty>Um idioma nativo é gratuito.</Empty>}
          <ul className="space-y-2">
            {character.languages.map((entry, index) => (
              <li key={entry.id} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
                <TextField label="Idioma" value={entry.name} onChange={(value) => edit((c) => void (c.languages[index].name = value))} />
                <label className="flex items-center gap-1 pb-2 text-sm">
                  <input type="checkbox" checked={entry.native} onChange={(event) => edit((c) => {
                    c.languages[index].native = event.target.checked;
                    c.languages[index].points = event.target.checked ? 0 : 1;
                  })} />
                  Nativo
                </label>
                {entry.native ? <span className="w-[5.5rem] pb-2 text-center font-mono text-accent">N</span> : (
                  <Stepper label={`Nível de ${entry.name || 'idioma'}`} value={entry.points} max={6} onChange={(value) => edit((c) => void (c.languages[index].points = value))} />
                )}
                <button type="button" className="btn btn-danger px-2!" aria-label="Remover idioma" onClick={() => edit((c) => void c.languages.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
