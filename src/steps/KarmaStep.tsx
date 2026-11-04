import { ATTRIBUTE_NAMES, CORE_ATTRIBUTES, byId, magicData, skillGroups, skills } from '../data';
import { attributeMax, effectiveSkills, edgeMax, isAwakened, isCaster, isTechnomancer, skillGroupRating, specialMax } from '../engine/derive';
import { newId, useCharacter } from '../store';
import { Empty, Meter, NumberField, Panel, Select, Stepper, TextField } from '../ui/primitives';

export function KarmaStep() {
  const { character, edit, derived } = useCharacter();

  const purchased = skills.filter((skill) => (character.skills[skill.id]?.points ?? 0) > 0 || (character.skills[skill.id]?.karmaRanks ?? 0) > 0 || character.awakening.freeSkills.includes(skill.id));
  const buyable = skills.filter((skill) => !purchased.includes(skill));

  const setKarmaRanks = (id: string, value: number) =>
    edit((c) => {
      const current = c.skills[id] ?? { points: 0, karmaRanks: 0, specialization: '', specBy: 'points' as const };
      c.skills[id] = { ...current, karmaRanks: value };
    });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Atributos">
          <p className="mb-2 text-sm text-mute">Novo nível x 5 Carma.</p>
          <ul className="space-y-1">
            {CORE_ATTRIBUTES.map((key) => (
              <li key={key} className="flex items-center justify-between gap-2">
                <span>{ATTRIBUTE_NAMES[key]}</span>
                <span className="ml-auto font-mono text-sm text-mute">{derived.natural[key]}</span>
                <Stepper label={`Carma em ${ATTRIBUTE_NAMES[key]}`} value={character.attributes[key].karmaRanks} max={attributeMax(character, key) - derived.natural[key] + character.attributes[key].karmaRanks} onChange={(value) => edit((c) => void (c.attributes[key].karmaRanks = value))} />
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span>Trunfo</span>
              <span className="ml-auto font-mono text-sm text-mute">{derived.edge}</span>
              <Stepper label="Carma em Trunfo" value={character.special.edge.karmaRanks} max={edgeMax(character) - derived.edge + character.special.edge.karmaRanks} onChange={(value) => edit((c) => void (c.special.edge.karmaRanks = value))} />
            </li>
            {isAwakened(character) && (
              <li className="flex items-center gap-2">
                <span>Magia</span>
                <span className="ml-auto font-mono text-sm text-mute">{derived.magicNatural}</span>
                <Stepper label="Carma em Magia" value={character.special.magic.karmaRanks} max={specialMax(character, 'magic') - derived.magicNatural + character.special.magic.karmaRanks} onChange={(value) => edit((c) => void (c.special.magic.karmaRanks = value))} />
              </li>
            )}
            {isTechnomancer(character) && (
              <li className="flex items-center gap-2">
                <span>Ressonância</span>
                <span className="ml-auto font-mono text-sm text-mute">{derived.resonanceNatural}</span>
                <Stepper label="Carma em Ressonância" value={character.special.resonance.karmaRanks} max={specialMax(character, 'resonance') - derived.resonanceNatural + character.special.resonance.karmaRanks} onChange={(value) => edit((c) => void (c.special.resonance.karmaRanks = value))} />
              </li>
            )}
          </ul>
        </Panel>

        <Panel title="Balanço de Carma">
          <ul className="space-y-0.5 font-mono text-sm">
            <li className="flex justify-between"><span>Inicial</span><span>{derived.karma.start}</span></li>
            {derived.karma.lines.filter((line) => line.value !== 0).map((line) => (
              <li key={line.label} className="flex justify-between">
                <span className="text-mute">{line.label}</span>
                <span className={line.value > 0 ? 'text-acid' : 'text-magenta'}>{line.value > 0 ? '+' : ''}{line.value}</span>
              </li>
            ))}
            <li className="mt-1 flex justify-between border-t border-line pt-1 text-base">
              <span>Restante (máx. 7 para o jogo)</span>
              <span className={derived.karma.remaining < 0 ? 'text-magenta' : 'text-cyan'}>{derived.karma.remaining}</span>
            </li>
          </ul>
        </Panel>
      </div>

      <Panel title="Perícias" aside={<span className="text-sm text-mute">Ativa: novo nível x 2 · Grupo: x 5 · Especialização: 7</span>}>
        <ul className="grid gap-x-6 gap-y-1 lg:grid-cols-2">
          {purchased.map((skill) => {
            const entry = character.skills[skill.id];
            const rating = effectiveSkills(character).find((row) => row.id === skill.id)?.rating ?? 0;
            return (
              <li key={skill.id} className="flex items-center gap-2">
                <span>{skill.name}</span>
                <span className="ml-auto font-mono text-sm text-mute">{rating}</span>
                <Stepper label={`Carma em ${skill.name}`} value={entry?.karmaRanks ?? 0} onChange={(value) => setKarmaRanks(skill.id, value)} />
              </li>
            );
          })}
          {skillGroups.filter((group) => skillGroupRating(character, group.id) > 0).map((group) => (
            <li key={group.id} className="flex items-center gap-2">
              <span>Grupo {group.name}</span>
              <span className="ml-auto font-mono text-sm text-mute">{skillGroupRating(character, group.id)}</span>
              <Stepper label={`Carma no grupo ${group.name}`} value={character.skillGroups[group.id]?.karmaRanks ?? 0} onChange={(value) => edit((c) => {
                const current = c.skillGroups[group.id] ?? { points: 0, karmaRanks: 0 };
                c.skillGroups[group.id] = { ...current, karmaRanks: value };
              })} />
            </li>
          ))}
        </ul>
        <div className="mt-3 max-w-xs">
          <Select label="Nova perícia" placeholder="Comprar nova perícia" value="" options={buyable.map((skill) => ({ value: skill.id, label: skill.name }))} onChange={(value) => setKarmaRanks(value, 1)} />
        </div>
      </Panel>

      <Panel title="Contatos" aside={<div className="w-52"><Meter label="Carma grátis" spent={derived.points.contacts.spent} pool={derived.points.contacts.pool} /></div>}>
        {!character.contacts.length && <Empty>Conexão + Lealdade custam 1 Carma por nível, com máximo de 7 por contato.</Empty>}
        <ul className="space-y-2">
          {character.contacts.map((contact, index) => (
            <li key={contact.id} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
              <TextField label="Nome" value={contact.name} onChange={(value) => edit((c) => void (c.contacts[index].name = value))} />
              <TextField label="Função" value={contact.role} onChange={(value) => edit((c) => void (c.contacts[index].role = value))} />
              <div>
                <div className="label">Conexão</div>
                <Stepper label="Conexão" value={contact.connection} min={1} onChange={(value) => edit((c) => void (c.contacts[index].connection = value))} />
              </div>
              <div>
                <div className="label">Lealdade</div>
                <Stepper label="Lealdade" value={contact.loyalty} min={1} onChange={(value) => edit((c) => void (c.contacts[index].loyalty = value))} />
              </div>
              <button type="button" className="btn btn-danger" aria-label={`Remover ${contact.name || 'contato'}`} onClick={() => edit((c) => void c.contacts.splice(index, 1))}>✕</button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn mt-3" onClick={() => edit((c) => void c.contacts.push({ id: newId(), name: '', role: '', connection: 1, loyalty: 1 }))}>+ Contato</button>
      </Panel>

      {isCaster(character) && (
        <Panel title="Espíritos vinculados" aside={<span className="text-sm text-mute">1 Carma por serviço · Poder = Magia ({derived.magic}) · Máx. {derived.natural.charisma}</span>}>
          <ul className="space-y-2">
            {character.spirits.map((spirit, index) => (
              <li key={spirit.id} className="flex items-center gap-3">
                <div className="flex-1"><Select label="Tipo de espírito" value={spirit.type} options={magicData.spiritTypes.map((value) => ({ value, label: value }))} onChange={(value) => edit((c) => void (c.spirits[index].type = value))} /></div>
                <Stepper label="Serviços" value={spirit.services} min={1} onChange={(value) => edit((c) => void (c.spirits[index].services = value))} />
                <button type="button" className="btn btn-danger" aria-label="Remover espírito" onClick={() => edit((c) => void c.spirits.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn mt-3" onClick={() => edit((c) => void c.spirits.push({ id: newId(), type: magicData.spiritTypes[0], services: 1 }))}>+ Espírito</button>
        </Panel>
      )}

      {isTechnomancer(character) && (
        <Panel title="Sprites registrados" aside={<span className="text-sm text-mute">1 Carma por tarefa · Nível = Ressonância ({derived.resonance}) · Máx. {derived.natural.charisma}</span>}>
          <ul className="space-y-2">
            {character.sprites.map((sprite, index) => (
              <li key={sprite.id} className="flex items-center gap-3">
                <div className="flex-1"><Select label="Tipo de sprite" value={sprite.type} options={magicData.spriteTypes.map((value) => ({ value, label: value }))} onChange={(value) => edit((c) => void (c.sprites[index].type = value))} /></div>
                <Stepper label="Tarefas" value={sprite.tasks} min={1} onChange={(value) => edit((c) => void (c.sprites[index].tasks = value))} />
                <button type="button" className="btn btn-danger" aria-label="Remover sprite" onClick={() => edit((c) => void c.sprites.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn mt-3" onClick={() => edit((c) => void c.sprites.push({ id: newId(), type: magicData.spriteTypes[0], tasks: 1 }))}>+ Sprite</button>
        </Panel>
      )}

      {isAwakened(character) && (
        <Panel title="Vincular focos" aside={<span className="text-sm text-mute">Poder total máx. {derived.magicNatural * 2}</span>}>
          <ul className="space-y-2">
            {character.foci.map((focus, index) => (
              <li key={focus.id} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_6rem_auto]">
                <TextField label="Nome" value={focus.name} onChange={(value) => edit((c) => void (c.foci[index].name = value))} />
                <Select label="Tipo de foco" value={focus.type} options={magicData.focusTypes.map((f) => ({ value: f.id, label: `${f.name} (Poder x ${f.bondMultiplier})` }))} onChange={(value) => edit((c) => void (c.foci[index].type = value))} />
                <NumberField label="Poder" min={1} value={focus.force} onChange={(value) => edit((c) => void (c.foci[index].force = value))} />
                <button type="button" className="btn btn-danger" aria-label={`Remover ${byId(magicData.focusTypes, focus.type)?.name}`} onClick={() => edit((c) => void c.foci.splice(index, 1))}>✕</button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn mt-3" onClick={() => edit((c) => void c.foci.push({ id: newId(), type: 'weapon', force: 1, name: '' }))}>+ Foco</button>
        </Panel>
      )}
    </div>
  );
}
