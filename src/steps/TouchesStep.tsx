import { useCharacter } from '../store';
import { Field, NumberField, Panel, TextField } from '../ui/primitives';

type TextKey = 'alias' | 'realName' | 'ethnicity' | 'age' | 'sex' | 'height' | 'weight';

const FIELDS: { key: TextKey; label: string }[] = [
  { key: 'alias', label: 'Nome/Pseudônimo primário' },
  { key: 'realName', label: 'Nome verdadeiro' },
  { key: 'ethnicity', label: 'Etnia' },
  { key: 'age', label: 'Idade' },
  { key: 'sex', label: 'Sexo' },
  { key: 'height', label: 'Altura' },
  { key: 'weight', label: 'Peso' },
];

export function TouchesStep({ onSheet }: { onSheet: () => void }) {
  const { character, edit } = useCharacter();
  const { personal } = character;
  return (
    <div className="space-y-4">
      <Panel title="Informações pessoais">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FIELDS.map(({ key, label }) => (
            <TextField key={key} label={label} value={personal[key]} onChange={(value) => edit((c) => void (c.personal[key] = value))} />
          ))}
        </div>
      </Panel>
      <Panel title="Reputação" term="concept:reputation">
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="Crédito das Ruas" term="concept:streetCred" value={personal.streetCred} onChange={(value) => edit((c) => void (c.personal.streetCred = value))} />
          <NumberField label="Notoriedade" term="concept:notoriety" value={personal.notoriety} onChange={(value) => edit((c) => void (c.personal.notoriety = value))} />
          <NumberField label="Consciência Pública" term="concept:publicAwareness" value={personal.publicAwareness} onChange={(value) => edit((c) => void (c.personal.publicAwareness = value))} />
        </div>
      </Panel>
      <Panel title="História">
        <div className="grid gap-3">
          <Field label="Histórico">
            <textarea className="input min-h-40" value={personal.background} onChange={(event) => edit((c) => void (c.personal.background = event.target.value))} />
          </Field>
          <Field label="Notas">
            <textarea className="input min-h-20" value={personal.notes} onChange={(event) => edit((c) => void (c.personal.notes = event.target.value))} />
          </Field>
        </div>
      </Panel>
      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onSheet}>Gerar ficha</button>
      </div>
    </div>
  );
}
