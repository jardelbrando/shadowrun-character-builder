import type { AwakeningType } from '../data';
import type { Character } from '../schema/character';
import { magicOptionOf } from './derive';

/**
 * A perícia gratuita substitui os pontos já gastos nela, que voltam para a reserva.
 * Conjuração 6 comprada com pontos vira 5 grátis + 1 ponto, mantendo o nível.
 */
export function toggleFreeSkill(c: Character, id: string) {
  const grant = magicOptionOf(c)?.skills;
  const chosen = c.awakening.freeSkills;
  if (chosen.includes(id)) {
    c.awakening.freeSkills = chosen.filter((skill) => skill !== id);
    return;
  }
  if (!grant || chosen.length >= grant.count) return;
  chosen.push(id);
  const entry = c.skills[id];
  if (entry) entry.points = Math.max(0, entry.points - grant.rating);
}

export function setAwakeningType(c: Character, type: AwakeningType) {
  if (c.awakening.type === type) return;
  c.awakening.type = type;
  c.awakening.freeSkills = [];
  c.awakening.freeSkillGroup = '';
}
