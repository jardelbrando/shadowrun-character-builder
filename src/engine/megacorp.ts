import megacorpsJson from '../data/megacorps.json';
import type { Character } from '../schema/character';
import { gearTotals, isAwakened, isTechnomancer } from './derive';
import type { StepId } from './validate';

export type Megacorp = (typeof megacorpsJson)[number];

const corp = (id: string) => megacorpsJson.find((item) => item.id === id) ?? megacorpsJson[0];

const hasAugmentation = (c: Character) => c.gear.some((item) => gearTotals(item).essence > 0);

/** A megacorp de olho no personagem, pelas escolhas dele. */
export function watcherCorp(c: Character): Megacorp {
  if (isAwakened(c)) return corp('wuxing');
  if (isTechnomancer(c)) return corp('neonet');
  if (hasAugmentation(c)) return corp('ares');
  if (c.metatype && c.metatype !== 'human') return corp('evo');
  return corp('saeder-krupp');
}

/** A megacorp que aparece em cada etapa. */
export function stepCorp(c: Character, step: StepId): Megacorp {
  switch (step) {
    case 'concept':
      return corp('saeder-krupp');
    case 'priorities':
      return c.metatype && c.metatype !== 'human' ? corp('evo') : corp('shiawase');
    case 'magic':
      return c.awakening.type === 'none' ? corp('mitsuhama') : watcherCorp(c);
    case 'qualities':
      return c.qualities.some((q) => q.id === 'vicio') ? corp('aztechnology') : corp('horizon');
    case 'skills':
      return corp('renraku');
    case 'resources':
      return hasAugmentation(c) ? corp('neonet') : corp('ares');
    case 'karma':
      return isAwakened(c) || isTechnomancer(c) ? watcherCorp(c) : corp('mitsuhama');
    case 'final':
      return corp('renraku');
    case 'touches':
      return corp('horizon');
  }
}
