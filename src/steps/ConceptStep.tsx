import { gameLevels } from '../data';
import { useCharacter } from '../store';
import { Choice, Panel, TextField } from '../ui/primitives';

const ROLES = ['Face', 'Conjurador', 'Tecnauta', 'Tecnomante', 'Fusor', 'Samurai Urbano'];

export function ConceptStep() {
  const { character, edit } = useCharacter();
  return (
    <div className="space-y-4">
      <Panel title="Conceito">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Nome de rua" value={character.personal.alias} onChange={(value) => edit((c) => void (c.personal.alias = value))} />
          <TextField label="Jogador" value={character.personal.player} onChange={(value) => edit((c) => void (c.personal.player = value))} />
          <TextField className="sm:col-span-2" label="Conceito" placeholder="Quem é este runner?" value={character.personal.concept} onChange={(value) => edit((c) => void (c.personal.concept = value))} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button key={role} type="button" className="btn" onClick={() => edit((c) => void (c.personal.concept = role))}>
              {role}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Nível de jogo" term="concept:gameLevel">
        <div className="grid gap-3 md:grid-cols-3">
          {gameLevels.map((level) => (
            <Choice key={level.id} selected={character.gameLevel === level.id} onClick={() => edit((c) => void (c.gameLevel = level.id as typeof c.gameLevel))}>
              <div className="font-display text-sm font-bold">{level.name}</div>
              <dl className="mt-2 grid grid-cols-2 gap-x-2 font-mono text-xs text-mute">
                <dt>Carma</dt>
                <dd className="text-right text-ink">{level.karma}</dd>
                <dt>Disponibilidade</dt>
                <dd className="text-right text-ink">{level.maxAvailability}</dd>
                <dt>Nível de dispositivo</dt>
                <dd className="text-right text-ink">{level.maxDeviceRating}</dd>
                <dt>Carma em ¥</dt>
                <dd className="text-right text-ink">{level.maxKarmaToNuyen}</dd>
              </dl>
            </Choice>
          ))}
        </div>
      </Panel>
    </div>
  );
}
