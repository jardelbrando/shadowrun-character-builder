import { skills } from '../data';
import { Term } from '../ui/Term';
import { toggleFreeSkill } from '../engine/actions';
import { useCharacter } from '../store';
import { Panel } from '../ui/primitives';

/** Usado nas Etapas 3 e 5, para a escolha estar onde o jogador procurar por ela. */
export function FreeSkillPicker() {
  const { character, edit, derived } = useCharacter();
  const grant = derived.option?.skills;
  if (!grant) return null;

  const chosen = character.awakening.freeSkills;
  const pending = grant.count - chosen.length;
  const choices = skills.filter((skill) => {
    if (grant.kind === 'magic') return skill.restricted === 'magic';
    if (grant.kind === 'resonance') return skill.restricted === 'resonance';
    return !skill.restricted;
  });

  return (
    <Panel
      title="Perícias gratuitas"
      term="concept:freeSkills"
      aside={<span className={`font-mono text-sm ${pending > 0 ? 'text-amber' : 'text-acid'}`}>{chosen.length} de {grant.count} escolhidas · nível {grant.rating}</span>}
    >
      <p className="mb-3 text-sm text-mute">
        {pending > 0
          ? `Clique para escolher ${pending === 1 ? 'mais 1 perícia' : `${pending} perícias`} de graça em nível ${grant.rating}. Pontos já gastos nela voltam para a sua reserva.`
          : 'Clique em uma perícia escolhida para trocá-la.'}
      </p>
      <div className="flex flex-wrap gap-2">
        {choices.map((skill) => {
          const selected = chosen.includes(skill.id);
          return (
            <button key={skill.id} type="button" aria-pressed={selected} disabled={!selected && pending <= 0} className={`btn ${selected ? 'btn-selected' : ''}`} onClick={() => edit((c) => toggleFreeSkill(c, skill.id))}>
              <span aria-hidden="true" className="font-mono">{selected ? '[X]' : '[ ]'}</span>
              <Term id={`skill:${skill.id}`} plain>{skill.name}</Term>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
