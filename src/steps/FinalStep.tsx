import { STEP_IDS, type StepId } from '../engine/validate';
import { Term } from '../ui/Term';
import { isTechnomancer } from '../engine/derive';
import { useCharacter } from '../store';
import { IssueList, Panel } from '../ui/primitives';
import { initiativeText } from '../sheet/format';

export const STEP_TITLES: Record<StepId, string> = {
  concept: 'Conceito',
  priorities: 'Prioridades',
  magic: 'Magia ou Ressonância',
  qualities: 'Qualidades',
  skills: 'Perícias',
  resources: 'Recursos',
  karma: 'Carma',
  final: 'Cálculos finais',
  touches: 'Toques finais',
};

function Stat({ label, term, value }: { label: string; term?: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line/60 py-0.5">
      <span className="text-mute">{term ? <Term id={term}>{label}</Term> : label}</span>
      <span className="font-mono text-accent">{value}</span>
    </div>
  );
}

export function FinalStep() {
  const { character, derived: d, issues } = useCharacter();
  const limit = (key: keyof typeof d.limits) => (d.limitBonus[key] ? `${d.limits[key]} (${d.limits[key] + d.limitBonus[key]})` : d.limits[key]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Iniciativas" term="stat:initiative">
          <Stat label="Física" term="stat:initiative" value={initiativeText(d.initiative.natural, d.initiative.value, d.initiative.dice)} />
          <Stat label="Astral" term="stat:astral" value={`${d.astralInitiative.value} + ${d.astralInitiative.dice}D6`} />
          <Stat label="Matriz RA" term="stat:matrix" value={`${d.matrixAR.value} + ${d.matrixAR.dice}D6`} />
          {isTechnomancer(character) && <Stat label="RV, sim fechado" term="stat:matrix" value={`${d.matrixCold.value} + ${d.matrixCold.dice}D6`} />}
          {isTechnomancer(character) && <Stat label="RV, sim aberto" term="stat:matrix" value={`${d.matrixHot.value} + ${d.matrixHot.dice}D6`} />}
        </Panel>
        <Panel title="Limites inerentes" term="stat:limits">
          <Stat label="Físico" term="stat:limit-physical" value={limit('physical')} />
          <Stat label="Mental" term="stat:limit-mental" value={limit('mental')} />
          <Stat label="Social" term="stat:limit-social" value={limit('social')} />
        </Panel>
        <Panel title="Monitor de condição" term="stat:monitor">
          <Stat label="Físico" term="stat:monitor-physical" value={d.monitors.physical} />
          <Stat label="Atordoamento" term="stat:monitor-stun" value={d.monitors.stun} />
          <Stat label="Excesso" term="stat:overflow" value={d.monitors.overflow} />
        </Panel>
        <Panel title="Testes de atributo">
          <Stat label="Compostura" term="stat:composure" value={d.composure} />
          <Stat label="Julgar Intenções" term="stat:judge" value={d.judgeIntentions} />
          <Stat label="Memória" term="stat:memory" value={d.memory} />
          <Stat label="Erguer/Carregar" term="stat:lift" value={d.liftCarry} />
        </Panel>
        <Panel title="Movimento" term="stat:movement">
          <Stat label="Andar" value={`${d.movement.walk} m`} />
          <Stat label="Correr" value={`${d.movement.run} m`} />
          <Stat label="Disparada" value={`+${d.movement.sprintPerHit} m/sucesso`} />
        </Panel>
        {isTechnomancer(character) && (
          <Panel title="Persona viva" term="persona:living">
            <Stat label="Ataque" term="persona:attack" value={d.persona.attack} />
            <Stat label="Corrupção" term="persona:sleaze" value={d.persona.sleaze} />
            <Stat label="Processamento de Dados" term="persona:data" value={d.persona.dataProcessing} />
            <Stat label="Firewall" term="persona:firewall" value={d.persona.firewall} />
            <Stat label="Nível de Dispositivo" term="persona:device" value={d.persona.deviceRating} />
          </Panel>
        )}
      </div>
      <Panel title="Revisão">
        <div className="grid gap-4 md:grid-cols-2">
          {STEP_IDS.map((step) => {
            const list = issues.filter((issue) => issue.step === step);
            return (
              <div key={step}>
                <h4 className="label mb-1">{STEP_TITLES[step]}</h4>
                <IssueList issues={list} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
