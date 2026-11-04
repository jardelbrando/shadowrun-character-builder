import { useState, type ReactNode } from 'react';
import { HoverCard } from 'radix-ui';
import { ATTRIBUTE_NAMES, byId, glossary, skillGroups, skills } from '../data';

function TermContent({ id }: { id: string }) {
  const entry = glossary[id];
  const skill = id.startsWith('skill:') ? byId(skills, id.slice(6)) : undefined;
  const group = skill && skillGroups.find((g) => g.skills.includes(skill.id));
  return (
    <>
      <p className="label text-accent!">{entry.kind}</p>
      <h4 className="mb-1 font-display text-sm font-bold text-ink uppercase">{entry.title}</h4>
      <p className="text-[0.95rem]">{entry.body}</p>
      {entry.effects && (
        <ul className="mt-2 space-y-0.5 text-sm text-mute">
          {entry.effects.map((effect) => (
            <li key={effect}><span aria-hidden="true" className="text-accent">▸ </span>{effect}</li>
          ))}
        </ul>
      )}
      {skill && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 border-t border-line pt-2 text-sm">
          <dt className="text-mute">Atributo</dt>
          <dd>{ATTRIBUTE_NAMES[skill.attribute]}</dd>
          {group && <dt className="text-mute">Grupo</dt>}
          {group && <dd>{group.name}</dd>}
          <dt className="text-mute">Teste-padrão</dt>
          <dd>{entry.default ? 'Permitido' : 'Não permitido'}</dd>
          {entry.specs && <dt className="text-mute">Especializações</dt>}
          {entry.specs && <dd>{entry.specs}</dd>}
        </dl>
      )}
    </>
  );
}

/**
 * Termo com explicação ao passar o mouse.
 * Fora de botões, também abre com foco e com toque. Dentro de um botão ou label
 * use `plain`: elementos interativos não podem ficar aninhados.
 */
export function Term({ id, children, plain = false, className = '' }: { id: string; children?: ReactNode; plain?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const entry = glossary[id];
  if (!entry) return <span className={className}>{children}</span>;
  const interactive = plain ? {} : { tabIndex: 0, role: 'button', onClick: () => setOpen(!open) };
  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={180} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <span {...interactive} className={`term ${className}`}>{children ?? entry.title}</span>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content side="top" align="start" sideOffset={6} collisionPadding={12} className="term-card">
          <TermContent id={id} />
          <HoverCard.Arrow className="fill-accent" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
