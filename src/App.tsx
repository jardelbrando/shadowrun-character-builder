import { useRef, useState, type ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dialog } from 'radix-ui';
import { STEP_IDS, type StepId } from './engine/validate';
import { downloadCharacter, parseCharacter, serializeCharacter } from './schema/io';
import { Sheet } from './sheet/Sheet';
import { ConceptStep } from './steps/ConceptStep';
import { FinalStep, STEP_TITLES } from './steps/FinalStep';
import { KarmaStep } from './steps/KarmaStep';
import { MagicStep } from './steps/MagicStep';
import { PrioritiesStep } from './steps/PrioritiesStep';
import { QualitiesStep } from './steps/QualitiesStep';
import { ResourcesStep } from './steps/ResourcesStep';
import { SkillsStep } from './steps/SkillsStep';
import { TouchesStep } from './steps/TouchesStep';
import { useCharacter, useCharacterStore } from './store';
import { AnimatedNumber, IssueList, formatNuyen } from './ui/primitives';

export function App() {
  const { character, derived, issues } = useCharacter();
  const load = useCharacterStore((state) => state.load);
  const reset = useCharacterStore((state) => state.reset);
  const [step, setStep] = useState<StepId>('concept');
  const [view, setView] = useState<'wizard' | 'sheet'>('wizard');
  const [showJson, setShowJson] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const index = STEP_IDS.indexOf(step);
  const stepIssues = issues.filter((issue) => issue.step === step);

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = parseCharacter(await file.text());
    if (result.ok) {
      load(result.character);
      setImportErrors([]);
      setView('sheet');
    } else {
      setImportErrors(result.errors);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'concept': return <ConceptStep />;
      case 'priorities': return <PrioritiesStep />;
      case 'magic': return <MagicStep />;
      case 'qualities': return <QualitiesStep />;
      case 'skills': return <SkillsStep />;
      case 'resources': return <ResourcesStep />;
      case 'karma': return <KarmaStep />;
      case 'final': return <FinalStep />;
      case 'touches': return <TouchesStep onSheet={() => setView('sheet')} />;
    }
  };

  return (
    <div className="mx-auto max-w-[110rem] p-4">
      <header className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="glitch font-display text-2xl font-bold tracking-wider text-cyan uppercase">Shadowrun 5</h1>
          <p className="label">Criador de ficha · Seattle, 2075</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" aria-pressed={view === 'sheet'} onClick={() => setView(view === 'sheet' ? 'wizard' : 'sheet')}>
            {view === 'sheet' ? 'Voltar às etapas' : 'Ver ficha'}
          </button>
          <button type="button" className="btn" aria-pressed={showJson} onClick={() => setShowJson(!showJson)}>JSON</button>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>Importar</button>
          <button type="button" className="btn btn-primary" onClick={() => downloadCharacter(character)}>Exportar</button>
          {view === 'sheet' && <button type="button" className="btn" onClick={() => window.print()}>Imprimir</button>}
          <button type="button" className="btn btn-danger" onClick={() => setConfirmReset(true)}>Novo</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden aria-label="Arquivo do personagem" onChange={onImport} />
        </div>
      </header>

      <AnimatePresence>
        {view === 'wizard' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="no-print mb-4 overflow-hidden">
            <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5">
              <Hud label="Carma" tone={derived.karma.remaining < 0 ? 'text-magenta' : 'text-acid'}><AnimatedNumber value={derived.karma.remaining} /></Hud>
              <Hud label="Neoienes" tone={derived.nuyen.remaining < 0 ? 'text-magenta' : 'text-amber'}><AnimatedNumber value={derived.nuyen.remaining} format={formatNuyen} /></Hud>
              <Hud label="Essência" tone="text-cyan"><AnimatedNumber value={derived.essence} format={(n) => n.toFixed(2)} /></Hud>
              <Hud label="Iniciativa" tone="text-cyan"><AnimatedNumber value={derived.initiative.value} format={(n) => `${n} + ${derived.initiative.dice}D6`} /></Hud>
              <Hud label="Limites F/M/S" tone="text-cyan">{derived.limits.physical}/{derived.limits.mental}/{derived.limits.social}</Hud>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`grid gap-4 ${showJson ? 'xl:grid-cols-[1fr_26rem]' : ''}`}>
        <main className="min-w-0">
          {view === 'sheet' ? (
            <Sheet />
          ) : (
            <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
              <nav aria-label="Etapas" className="no-print">
                <ol className="space-y-1 lg:sticky lg:top-4">
                  {STEP_IDS.map((id, position) => {
                    const errors = issues.filter((issue) => issue.step === id && issue.severity === 'error').length;
                    const active = id === step;
                    return (
                      <li key={id}>
                        <button type="button" aria-current={active ? 'step' : undefined} onClick={() => setStep(id)} className={`relative flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left ${active ? 'text-cyan' : 'text-mute hover:text-ink'}`}>
                          {active && <motion.span layoutId="active-step" className="absolute inset-0 border-l-2 border-cyan bg-cyan/10" />}
                          <span className="relative font-mono text-xs">{String(position + 1).padStart(2, '0')}</span>
                          <span className="relative">{STEP_TITLES[id]}</span>
                          <span className={`relative ml-auto font-mono text-xs ${errors ? 'text-magenta' : 'text-acid'}`}>{errors ? errors : '✓'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, x: 24, filter: 'blur(4px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -24, filter: 'blur(4px)' }} transition={{ duration: 0.2 }}>
                    <h2 className="neon mb-3 font-display text-xl font-bold text-cyan uppercase">
                      <span className="text-magenta">{index + 1}.</span> {STEP_TITLES[step]}
                    </h2>
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
                {step !== 'final' && (
                  <div className="mt-4 border border-line bg-panel/70 p-3">
                    <IssueList issues={stepIssues} />
                  </div>
                )}
                <div className="mt-4 flex justify-between">
                  <button type="button" className="btn" disabled={index === 0} onClick={() => setStep(STEP_IDS[index - 1])}>◂ Anterior</button>
                  <button type="button" className="btn btn-primary" disabled={index === STEP_IDS.length - 1} onClick={() => setStep(STEP_IDS[index + 1])}>Próxima ▸</button>
                </div>
              </div>
            </div>
          )}
        </main>

        <AnimatePresence>
          {showJson && (
            <motion.aside initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="no-print min-w-0">
              <div className="cut sticky top-4 border border-line bg-panel p-3">
                <h3 className="label mb-2">JSON do personagem</h3>
                <pre className="max-h-[80vh] overflow-auto font-mono text-xs text-acid">{serializeCharacter(character)}</pre>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <Dialog.Root open={importErrors.length > 0} onOpenChange={(open) => !open && setImportErrors([])}>
        <DialogBody title="Arquivo recusado" description="O JSON não segue o formato do personagem.">
          <ul className="max-h-60 overflow-y-auto font-mono text-sm text-magenta">
            {importErrors.slice(0, 20).map((message) => <li key={message}>{message}</li>)}
          </ul>
          <Dialog.Close className="btn mt-3">Fechar</Dialog.Close>
        </DialogBody>
      </Dialog.Root>

      <Dialog.Root open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogBody title="Começar de novo?" description="O personagem atual será apagado deste navegador. Exporte antes se quiser guardá-lo.">
          <div className="mt-3 flex justify-end gap-2">
            <Dialog.Close className="btn">Cancelar</Dialog.Close>
            <button type="button" className="btn btn-danger" onClick={() => { reset(); setStep('concept'); setView('wizard'); setConfirmReset(false); }}>Apagar</button>
          </div>
        </DialogBody>
      </Dialog.Root>
    </div>
  );
}

function Hud({ label, tone, children }: { label: string; tone: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel px-3 py-2">
      <div className="label">{label}</div>
      <div className={`font-mono text-xl ${tone}`}>{children}</div>
    </div>
  );
}

function DialogBody({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
      <Dialog.Content className="cut fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-magenta bg-panel p-4">
        <Dialog.Title className="font-display font-bold text-magenta uppercase">{title}</Dialog.Title>
        <Dialog.Description className="mb-2 text-mute">{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
