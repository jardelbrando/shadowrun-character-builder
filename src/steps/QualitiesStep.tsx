import { useState } from 'react';
import { ATTRIBUTE_NAMES, CORE_ATTRIBUTES, LIMIT_NAMES, byId, qualities, type LimitKey, type Quality } from '../data';
import { qualityValue } from '../engine/derive';
import { qualityEntrySchema, type QualityEntry } from '../schema/character';
import { useCharacter } from '../store';
import { Choice, Empty, Field, Meter, Panel, Select, Stepper } from '../ui/primitives';

const costLabel = (quality: Quality) => {
  if (quality.options) {
    const values = quality.options.map((o) => o.cost);
    const [min, max] = [Math.min(...values), Math.max(...values)];
    return min === max ? `${min}` : `${min}–${max}`;
  }
  return quality.maxRating ? `${quality.cost}/nível` : `${quality.cost}`;
};

export function QualitiesStep() {
  const { character, edit, derived } = useCharacter();
  const [kind, setKind] = useState<Quality['kind']>('positive');
  const [filter, setFilter] = useState('');
  const limit = derived.level.qualityLimit;

  const add = (quality: Quality) =>
    edit((c) => void c.qualities.push(qualityEntrySchema.parse({ id: quality.id, option: quality.options?.[0].label ?? '' })));

  const list = qualities.filter((q) => q.kind === kind && q.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel title="Catálogo" term="concept:qualities">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <Choice selected={kind === 'positive'} onClick={() => setKind('positive')}>Positivas</Choice>
          <Choice selected={kind === 'negative'} onClick={() => setKind('negative')}>Negativas</Choice>
        </div>
        <input className="input mb-3" placeholder="Buscar qualidade" aria-label="Buscar qualidade" value={filter} onChange={(event) => setFilter(event.target.value)} />
        <ul className="max-h-[32rem] space-y-1 overflow-y-auto pr-1">
          {list.map((quality) => {
            const owned = character.qualities.some((q) => q.id === quality.id);
            return (
              <li key={quality.id}>
                <button type="button" disabled={owned && !quality.repeatable} className="w-full cursor-pointer border border-line px-2 py-1 text-left hover:border-accent disabled:cursor-not-allowed disabled:opacity-40" onClick={() => add(quality)}>
                  <span className="flex justify-between gap-2">
                    <span>{quality.name}</span>
                    <span className="font-mono text-sm text-accent">{costLabel(quality)}</span>
                  </span>
                  <span className="block text-sm text-mute">{quality.summary}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="space-y-4">
        <Panel title="Limites">
          <div className="grid gap-3 sm:grid-cols-2">
            <Meter label="Positivas" spent={derived.karma.positive} pool={limit} />
            <Meter label="Negativas" spent={derived.karma.negative} pool={limit} />
          </div>
        </Panel>
        <Panel title="Escolhidas">
          {!character.qualities.length && <Empty>Nenhuma qualidade escolhida.</Empty>}
          <ul className="space-y-2">
            {character.qualities.map((entry, index) => (
              <EntryRow key={`${entry.id}-${index}`} entry={entry} index={index} />
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function EntryRow({ entry, index }: { entry: QualityEntry; index: number }) {
  const { edit } = useCharacter();
  const quality = byId(qualities, entry.id);
  if (!quality) return null;
  const change = (recipe: (q: QualityEntry) => void) => edit((c) => recipe(c.qualities[index]));
  return (
    <li className={`border-l-2 bg-panel-2 p-2 ${quality.kind === 'positive' ? 'border-acid' : 'border-accent'}`}>
      <div className="flex items-center justify-between gap-2">
        <span>{quality.name}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-sm">{quality.kind === 'positive' ? '–' : '+'}{qualityValue(entry)}</span>
          <button type="button" className="btn btn-danger px-2! py-0!" aria-label={`Remover ${quality.name}`} onClick={() => edit((c) => void c.qualities.splice(index, 1))}>✕</button>
        </span>
      </div>
      <div className="mt-1 grid gap-2 empty:hidden sm:grid-cols-2">
        {quality.maxRating && (
          <div className="flex items-center gap-2">
            <span className="label">Nível</span>
            <Stepper label={`Nível de ${quality.name}`} value={entry.rating} min={1} max={quality.maxRating} onChange={(value) => change((q) => void (q.rating = value))} />
          </div>
        )}
        {quality.options && (
          <Select label={`Opção de ${quality.name}`} value={entry.option} options={quality.options.map((o) => ({ value: o.label, label: `${o.label} (${o.cost})` }))} onChange={(value) => change((q) => void (q.option = value))} />
        )}
        {quality.choice === 'attribute' && (
          <Select label="Atributo" value={entry.attribute} options={[...CORE_ATTRIBUTES, 'magic', 'resonance'].map((value) => ({ value, label: ATTRIBUTE_NAMES[value] }))} onChange={(value) => change((q) => void (q.attribute = value))} />
        )}
        {quality.needsNote && (
          <input className="input" placeholder={quality.needsNote} aria-label={quality.needsNote} value={entry.note} onChange={(event) => change((q) => void (q.note = event.target.value))} />
        )}
      </div>
      {quality.choice === 'limits' && (
        <div className="mt-2 flex flex-wrap gap-3">
          {(Object.keys(LIMIT_NAMES) as LimitKey[]).map((limit) => (
            <Field key={limit} label={LIMIT_NAMES[limit]}>
              <Stepper label={`Limite ${LIMIT_NAMES[limit]}`} value={entry.limits[limit]} max={entry.rating} onChange={(value) => change((q) => void (q.limits[limit] = value))} />
            </Field>
          ))}
        </div>
      )}
    </li>
  );
}
