import { useEffect, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Select as RadixSelect } from 'radix-ui';
import type { Issue } from '../engine/validate';

export function Panel({ title, aside, children, className = '' }: { title?: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`cut border border-line bg-panel/90 p-4 ${className}`}>
      {(title || aside) && (
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="font-display text-sm font-bold tracking-wide text-cyan uppercase">{title}</h3>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="label">{label}</span>
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

export function NumberField({ label, value, onChange, min = 0, step = 1, className }: { label: string; value: number; onChange: (value: number) => void; min?: number; step?: number; className?: string }) {
  return (
    <Field label={label} className={className}>
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
      <motion.span key={value} initial={{ scale: 1.35, color: '#22e6ff' }} animate={{ scale: 1, color: '#e6e6f2' }} className="w-8 text-center font-mono">
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
      className={`cut-sm border p-3 text-left transition-colors ${
        selected ? 'border-cyan bg-cyan/10 shadow-[inset_0_0_18px_rgb(34_230_255/0.15)]' : 'border-line bg-panel-2 hover:border-mute'
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
        <RadixSelect.Icon className="text-cyan">▾</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content position="popper" sideOffset={4} className="z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden border border-cyan bg-panel shadow-[0_0_24px_rgb(34_230_255/0.25)]">
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className="cursor-pointer px-2 py-1 outline-none data-highlighted:bg-cyan/15 data-highlighted:text-cyan data-[state=checked]:text-acid">
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

export function Meter({ label, spent, pool }: { label: string; spent: number; pool: number }) {
  const left = pool - spent;
  const tone = left < 0 ? 'bg-magenta' : left === 0 ? 'bg-acid' : 'bg-cyan';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label">{label}</span>
        <span className={`font-mono text-sm ${left < 0 ? 'text-magenta' : ''}`}>
          {spent} / {pool}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden bg-line">
        <motion.div className={`h-full ${tone}`} animate={{ width: `${pool ? Math.min(100, (spent / pool) * 100) : 0}%` }} transition={{ duration: 0.3 }} />
      </div>
    </div>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return <p className="font-mono text-sm text-acid">✓ Sem pendências nesta etapa.</p>;
  return (
    <ul className="space-y-1 text-[0.95rem]">
      {issues.map((issue, index) => (
        <motion.li key={issue.message + index} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={issue.severity === 'error' ? 'text-magenta' : 'text-amber'}>
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
