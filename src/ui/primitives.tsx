import { useEffect, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Select as RadixSelect } from 'radix-ui';
import type { Issue } from '../engine/validate';
import { Term } from './Term';

export function Panel({ title, term, aside, children, className = '' }: { title?: string; term?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`cut border border-line bg-panel/90 p-4 ${className}`}>
      {(title || aside) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h3 className="font-display text-sm font-bold tracking-wide text-accent uppercase">
              <span aria-hidden="true" className="mr-2 font-tag text-lg text-accent">//</span>
              {term ? <Term id={term}>{title}</Term> : title}
            </h3>
          )}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, term, children, className = '' }: { label: string; term?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label">{term ? <Term id={term} plain>{label}</Term> : label}</span>
      {children}
    </label>
  );
}

export function TextField({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <Field label={label} className={className}>
      <input className="input" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

export function NumberField({ label, term, value, onChange, min = 0, step = 1, className }: { label: string; term?: string; value: number; onChange: (value: number) => void; min?: number; step?: number; className?: string }) {
  return (
    <Field label={label} term={term} className={className}>
      <input
        className="input font-mono"
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
      />
    </Field>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99, label }: { value: number; onChange: (value: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="flex items-center" role="group" aria-label={label}>
      <button type="button" className="btn px-2! py-0.5!" disabled={value <= min} aria-label={`Diminuir ${label}`} onClick={() => onChange(value - 1)}>
        –
      </button>
      <motion.span key={value} initial={{ scale: 1.35, color: '#ff3131' }} animate={{ scale: 1, color: '#e6e6f2' }} className="w-8 text-center font-mono">
        {value}
      </motion.span>
      <button type="button" className="btn px-2! py-0.5!" disabled={value >= max} aria-label={`Aumentar ${label}`} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

export function Choice({ selected, disabled, onClick, children, className = '' }: { selected: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`cut-sm border border-l-4 p-3 text-left ${
        selected ? 'border-accent border-l-blood bg-accent/10 shadow-[inset_0_0_18px_rgb(255_49_49/0.15)]' : 'border-line bg-panel-2 hover:border-mute'
      } ${disabled ? 'cursor-not-allowed opacity-35' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Select({ value, onChange, options, placeholder = 'Selecionar', label }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; placeholder?: string; label: string }) {
  return (
    <RadixSelect.Root value={value || undefined} onValueChange={onChange}>
      <RadixSelect.Trigger className="input flex items-center justify-between gap-2 text-left" aria-label={label}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-accent">▾</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={4} className="z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden border border-accent bg-panel shadow-[0_0_24px_rgb(255_49_49/0.25)]">
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className="cursor-pointer px-2 py-1 outline-none data-highlighted:bg-accent/15 data-highlighted:text-accent data-[state=checked]:text-acid">
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function AnimatedNumber({ value, format = (n: number) => `${n}` }: { value: number; format?: (n: number) => string }) {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (latest) => format(Math.round(latest * 100) / 100));
  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.35, ease: 'easeOut' });
    return () => controls.stop();
  }, [motionValue, value]);
  return <motion.span>{text}</motion.span>;
}

export function Meter({ label, term, spent, pool }: { label: string; term?: string; spent: number; pool: number }) {
  const left = pool - spent;
  const tone = left < 0 ? 'bg-blood' : left === 0 ? 'bg-acid' : 'bg-accent';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label">{term ? <Term id={term}>{label}</Term> : label}</span>
        <span className={`font-mono text-sm ${left < 0 ? 'text-alert' : ''}`}>
          {spent} / {pool}
        </span>
      </div>
      <div className={`relative h-2 overflow-hidden bg-line ${left < 0 ? 'alarm' : ''}`}>
        <motion.div className={`h-full ${tone}`} animate={{ width: `${pool ? Math.min(100, (spent / pool) * 100) : 0}%` }} transition={{ duration: 0.3 }} />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_6px,var(--color-void)_6px_8px)]" />
      </div>
    </div>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return <p className="font-mono text-sm text-acid">✓ Sem pendências nesta etapa.</p>;
  return (
    <ul className="space-y-1 text-[0.95rem]">
      {issues.map((issue, index) => (
        <motion.li key={issue.message + index} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={issue.severity === 'error' ? 'text-alert' : 'text-amber'}>
          {issue.severity === 'error' ? '✖' : '▲'} {issue.message}
        </motion.li>
      ))}
    </ul>
  );
}

export function formatNuyen(value: number) {
  return `${Math.round(value).toLocaleString('pt-BR')}¥`;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-mute">{children}</p>;
}
