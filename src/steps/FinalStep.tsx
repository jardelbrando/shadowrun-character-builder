import { STEP_IDS, type StepId } from '../engine/validate';
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line/60 py-0.5">
      <span className="text-mute">{label}</span>
      <span className="font-mono text-cyan">{value}</span>
    </div>
  );
}

export function FinalStep() {
  const { character, derived: d, issues } = useCharacter();
  const limit = (key: keyof typeof d.limits) => (d.limitBonus[key] ? `${d.limits[key]} (${d.limits[key] + d.limitBonus[key]})` : d.limits[key]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Iniciativas">
          <Stat label="Física" value={initiativeText(d.initiative.natural, d.initiative.value, d.initiative.dice)} />
          <Stat label="Astral" value={`${d.astralInitiative.value} + ${d.astralInitiative.dice}D6`} />
          <Stat label="Matriz RA" value={`${d.matrixAR.value} + ${d.matrixAR.dice}D6`} />
          {isTechnomancer(character) && <Stat label="RV, sim fechado" value={`${d.matrixCold.value} + ${d.matrixCold.dice}D6`} />}
          {isTechnomancer(character) && <Stat label="RV, sim aberto" value={`${d.matrixHot.value} + ${d.matrixHot.dice}D6`} />}
        </Panel>
        <Panel title="Limites inerentes">
          <Stat label="Físico" value={limit('physical')} />
          <Stat label="Mental" value={limit('mental')} />
          <Stat label="Social" value={limit('social')} />
        </Panel>
        <Panel title="Monitor de condição">
          <Stat label="Físico" value={d.monitors.physical} />
          <Stat label="Atordoamento" value={d.monitors.stun} />
          <Stat label="Excesso" value={d.monitors.overflow} />
        </Panel>
        <Panel title="Testes de atributo">
          <Stat label="Compostura" value={d.composure} />
          <Stat label="Julgar Intenções" value={d.judgeIntentions} />
          <Stat label="Memória" value={d.memory} />
          <Stat label="Erguer/Carregar" value={d.liftCarry} />
        </Panel>
        <Panel title="Movimento">
          <Stat label="Andar" value={`${d.movement.walk} m`} />
          <Stat label="Correr" value={`${d.movement.run} m`} />
          <Stat label="Disparada" value={`+${d.movement.sprintPerHit} m/sucesso`} />
        </Panel>
        {isTechnomancer(character) && (
          <Panel title="Persona viva">
            <Stat label="Ataque" value={d.persona.attack} />
            <Stat label="Corrupção" value={d.persona.sleaze} />
            <Stat label="Processamento de Dados" value={d.persona.dataProcessing} />
            <Stat label="Firewall" value={d.persona.firewall} />
            <Stat label="Nível de Dispositivo" value={d.persona.deviceRating} />
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
