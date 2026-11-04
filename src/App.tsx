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
import { stepCorp } from './engine/megacorp';
import { CorpBanner } from './ui/CorpBanner';
import { CrtOverlay, crtBurst } from './ui/CrtOverlay';
import { GraffitiWall } from './ui/GraffitiWall';
import { Term } from './ui/Term';
import { AnimatedNumber, IssueList, formatNuyen } from './ui/primitives';

const FX_STORAGE_KEY = 'sr5-fx';
const TICKER_TEXT = ' /// VIGIE A RETAGUARDA /// ATIRE CERTO /// CONSERVE MUNIÇÃO /// NUNCA FAÇA ACORDOS COM UM DRAGÃO /// AS DEZ MEGAS ESTÃO OLHANDO';

function readFxPreference() {
  try {
    return localStorage.getItem(FX_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

function saveFxPreference(enabled: boolean) {
  try {
    localStorage.setItem(FX_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // A preferência só dura até recarregar a página.
  }
}

export function App() {
  const { character, derived, issues } = useCharacter();
  const load = useCharacterStore((state) => state.load);
  const reset = useCharacterStore((state) => state.reset);
  const [step, setStep] = useState<StepId>('concept');
  const [view, setView] = useState<'wizard' | 'sheet'>('wizard');
  const [showJson, setShowJson] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [fxEnabled, setFxEnabled] = useState(readFxPreference);
  const fileInput = useRef<HTMLInputElement>(null);

  const goTo = (id: StepId) => {
    setStep(id);
    if (id !== step) crtBurst();
  };

  const toggleFx = () => {
    saveFxPreference(!fxEnabled);
    setFxEnabled(!fxEnabled);
  };

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
      crtBurst(420);
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
      <GraffitiWall />
      {fxEnabled && <CrtOverlay />}
      <header className="no-print mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="glitch font-spray text-4xl tracking-wider text-accent uppercase" data-text="Shadowrun 5">Shadowrun 5</h1>
          <p className="label">Criador de ficha · Seattle, 2075</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn" aria-pressed={fxEnabled} title="Liga ou desliga estática e interferência" onClick={toggleFx}>Estática: {fxEnabled ? 'ligada' : 'desligada'}</button>
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
      <div className="ticker no-print mb-4" aria-hidden="true">
        <span>{TICKER_TEXT.repeat(6)}</span>
      </div>

      <AnimatePresence>
        {view === 'wizard' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="no-print mb-4 overflow-hidden">
            <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-5">
              <Hud label="Carma" term="stat:karma" alarm={derived.karma.remaining < 0} tone={derived.karma.remaining < 0 ? 'text-alert' : 'text-acid'}><AnimatedNumber value={derived.karma.remaining} /></Hud>
              <Hud label="Neoienes" term="stat:nuyen" alarm={derived.nuyen.remaining < 0} tone={derived.nuyen.remaining < 0 ? 'text-alert' : 'text-amber'}><AnimatedNumber value={derived.nuyen.remaining} format={formatNuyen} /></Hud>
              <Hud label="Essência" term="attr:essence" tone="text-accent"><AnimatedNumber value={derived.essence} format={(n) => n.toFixed(2)} /></Hud>
              <Hud label="Iniciativa" term="stat:initiative" tone="text-accent"><AnimatedNumber value={derived.initiative.value} format={(n) => `${n} + ${derived.initiative.dice}D6`} /></Hud>
              <Hud label="Limites F/M/S" term="stat:limits" tone="text-accent">{derived.limits.physical}/{derived.limits.mental}/{derived.limits.social}</Hud>
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
                        <button type="button" aria-current={active ? 'step' : undefined} onClick={() => goTo(id)} className={`relative flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left ${active ? 'text-accent' : 'text-mute hover:text-ink'}`}>
                          {active && <motion.span layoutId="active-step" transition={{ duration: 0.08 }} className="absolute inset-0 border-l-4 border-blood bg-accent/10" />}
                          <span className="relative font-mono text-xs">{String(position + 1).padStart(2, '0')}</span>
                          <span className="relative">{STEP_TITLES[id]}</span>
                          <span className={`relative ml-auto font-mono text-xs ${errors ? 'text-alert' : 'text-acid'}`}>{errors ? errors : '✓'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={step} className="tear-in" initial={{ opacity: 0, x: -30 }} animate={{ opacity: [0, 1, 0.35, 1], x: [-30, 16, -7, 0] }} exit={{ opacity: 0, x: 14, transition: { duration: 0.06 } }} transition={{ duration: 0.26, ease: 'linear' }}>
                    <h2 className="neon mb-3 font-display text-xl font-bold text-accent uppercase">
                      <span className="mr-1 font-tag text-3xl text-ink">{index + 1}.</span> {STEP_TITLES[step]}
                    </h2>
                    <CorpBanner corp={stepCorp(character, step)} label="Corte Corporativa" />
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
                {step !== 'final' && (
                  <div className="mt-4 border border-line bg-panel/70 p-3">
                    <IssueList issues={stepIssues} />
                  </div>
                )}
                <div className="mt-4 flex justify-between">
                  <button type="button" className="btn" disabled={index === 0} onClick={() => goTo(STEP_IDS[index - 1])}>◂ Anterior</button>
                  <button type="button" className="btn btn-primary" disabled={index === STEP_IDS.length - 1} onClick={() => goTo(STEP_IDS[index + 1])}>Próxima ▸</button>
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
          <ul className="max-h-60 overflow-y-auto font-mono text-sm text-alert">
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

function Hud({ label, term, tone, alarm = false, children }: { label: string; term: string; tone: string; alarm?: boolean; children: React.ReactNode }) {
  return (
    <div className={`bg-panel px-3 py-2 ${alarm ? 'alarm' : ''}`}>
      <div className="label"><Term id={term}>{label}</Term></div>
      <div className={`font-mono text-xl ${tone}`}>{children}</div>
    </div>
  );
}

function DialogBody({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
      <Dialog.Content className="cut-sm fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-blood bg-panel p-4">
        <Dialog.Title className="font-display font-bold text-alert uppercase">{title}</Dialog.Title>
        <Dialog.Description className="mb-2 text-mute">{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
