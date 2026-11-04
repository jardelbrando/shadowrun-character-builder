import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import type { Megacorp } from '../engine/megacorp';

function Emblem({ corp }: { corp: Megacorp }) {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" aria-hidden="true">
      {corp.shape === 'hex' && <polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="none" stroke="currentColor" strokeWidth="4" />}
      {corp.shape === 'circle' && <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" />}
      {corp.shape === 'square' && <rect x="6" y="6" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="4" />}
      <text x="32" y="41" textAnchor="middle" fontFamily="Orbitron, sans-serif" fontWeight="700" fontSize="22" fill="currentColor">{corp.monogram}</text>
    </svg>
  );
}

/** Cartaz corporativo pichado. A chave pela megacorp refaz a animação quando ela muda. */
export function CorpBanner({ corp, label }: { corp: Megacorp; label: string }) {
  return (
    <motion.aside
      key={corp.id}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: [0, 1, 0.5, 1], x: [18, -6, 3, 0] }}
      transition={{ duration: 0.3, ease: 'linear' }}
      aria-label={`${label}: ${corp.name}`}
      className="corp-poster"
      style={{ '--corp': corp.color } as CSSProperties}
    >
      <div className="flex items-center gap-3 text-(--corp)">
        <Emblem corp={corp} />
        <div className="min-w-0">
          <p className="label">{label}</p>
          <p className="font-display text-sm font-bold uppercase">{corp.name}</p>
          <p className="text-sm text-mute">{corp.focus}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {corp.slogan && <p className="corp-slogan">“{corp.slogan}”</p>}
        <p className="text-sm">{corp.line}</p>
      </div>
      <p className="corp-tag" aria-label={`Pichação: ${corp.tag}`}>{corp.tag}</p>
    </motion.aside>
  );
}
