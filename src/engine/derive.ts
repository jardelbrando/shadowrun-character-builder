import {
  CORE_ATTRIBUTES,
  byId,
  adeptPowers,
  gameLevels,
  grades,
  lifestyles,
  magicData,
  metatypes,
  priorities,
  programs,
  qualities,
  skillGroups,
  skills,
  type CoreAttribute,
  type GameLevel,
  type LimitKey,
  type MagicOption,
  type Metatype,
  type PriorityLevel,
} from '../data';
import type { Character, GearItem, QualityEntry } from '../schema/character';

const CREATION_STARTING_ESSENCE = 6;
const KARMA_TO_NUYEN_RATE = 2000;
export const MAX_CARRIED_NUYEN = 5000;
export const MAX_CARRIED_KARMA = 7;
export const MAX_AUGMENTATION_BONUS = 4;
export const SPELL_KARMA = 5;
export const COMPLEX_FORM_KARMA = 4;
export const POWER_POINT_KARMA = 5;
export const SPECIALIZATION_KARMA = 7;

/** Custo cumulativo de subir de `from` para `to`, a `multiplier` Carma por novo nível. */
export function karmaCost(from: number, to: number, multiplier: number) {
  let total = 0;
  for (let level = from + 1; level <= to; level++) total += level * multiplier;
  return total;
}

export const gameLevelOf = (c: Character): GameLevel => byId(gameLevels, c.gameLevel) ?? gameLevels[1];
export const metatypeOf = (c: Character): Metatype | undefined => byId(metatypes, c.metatype);

export function magicOptionOf(c: Character): MagicOption | undefined {
  const level = c.priorities.magicResonance;
  if (!level || c.awakening.type === 'none') return undefined;
  return priorities[level].magic[c.awakening.type];
}

export const hasQuality = (c: Character, id: string) => c.qualities.some((q) => q.id === id);

export function qualityValue(entry: QualityEntry) {
  const quality = byId(qualities, entry.id);
  if (!quality) return 0;
  if (quality.options) return quality.options.find((o) => o.label === entry.option)?.cost ?? quality.options[0].cost;
  return quality.cost * (quality.maxRating ? entry.rating : 1);
}

export function resourcesFor(c: Character, level: PriorityLevel | null) {
  if (!level) return 0;
  return gameLevelOf(c).resources?.[level] ?? priorities[level].resources;
}

export function gearTotals(item: GearItem) {
  const grade = byId(grades, item.grade) ?? grades[0];
  return {
    cost: item.unitCost * grade.cost * item.quantity,
    essence: item.essence * grade.essence * item.quantity,
    availability: item.availability + grade.availability,
  };
}

export function adeptPowerCost(id: string, rating: number) {
  const power = byId(adeptPowers, id);
  if (!power) return 0;
  if (power.costByRating) return power.costByRating[rating - 1] ?? 0;
  return power.cost * (power.perRating ? rating : 1);
}

export function naturalAttribute(c: Character, key: CoreAttribute) {
  const base = metatypeOf(c)?.attributes[key][0] ?? 1;
  return base + c.attributes[key].points + c.attributes[key].karmaRanks;
}

export function attributeMax(c: Character, key: CoreAttribute) {
  const natural = metatypeOf(c)?.attributes[key][1] ?? 6;
  const exceptional = c.qualities.some((q) => q.id === 'atributo-excepcional' && q.attribute === key);
  return natural + (exceptional ? 1 : 0);
}

export const edgeBase = (c: Character) => metatypeOf(c)?.attributes.edge[0] ?? 1;

export const edgeMax = (c: Character) =>
  (metatypeOf(c)?.attributes.edge[1] ?? 6) + (hasQuality(c, 'sortudo') ? 1 : 0);

export function specialMax(c: Character, key: 'magic' | 'resonance') {
  const exceptional = c.qualities.some((q) => q.id === 'atributo-excepcional' && q.attribute === key);
  return 6 + (exceptional ? 1 : 0);
}

export const isCaster = (c: Character) => ['mage', 'mysticAdept', 'aspected'].includes(c.awakening.type);
export const isAdept = (c: Character) => ['adept', 'mysticAdept'].includes(c.awakening.type);
export const isTechnomancer = (c: Character) => c.awakening.type === 'technomancer';
export const isAwakened = (c: Character) => isCaster(c) || isAdept(c);

function essenceSpent(c: Character) {
  return c.gear.reduce((sum, item) => sum + gearTotals(item).essence, 0);
}

function augmentationBonus(c: Character, key: CoreAttribute) {
  const gear = c.gear.reduce((sum, item) => sum + (item.attributeBonuses[key] ?? 0) * item.quantity, 0);
  const powers = c.adeptPowers.reduce((sum, power) => {
    if (power.id === 'atributo-fisico-melhorado' && power.choice === key) return sum + power.rating;
    if (power.id === 'reflexos-melhorados' && key === 'reaction') return sum + power.rating;
    return sum;
  }, 0);
  return gear + powers;
}

export function skillGroupRating(c: Character, id: string) {
  const entry = c.skillGroups[id];
  const free = c.awakening.freeSkillGroup === id ? (magicOptionOf(c)?.skillGroup?.rating ?? 0) : 0;
  return free + (entry?.points ?? 0) + (entry?.karmaRanks ?? 0);
}

export function freeSkillRating(c: Character, id: string) {
  if (!c.awakening.freeSkills.includes(id)) return 0;
  return magicOptionOf(c)?.skills?.rating ?? 0;
}

/** Nível vindo só da compra individual, sem contar grupos. */
export function skillRating(c: Character, id: string) {
  const entry = c.skills[id];
  return freeSkillRating(c, id) + (entry?.points ?? 0) + (entry?.karmaRanks ?? 0);
}

export function effectiveSkills(c: Character) {
  const rows = new Map<string, { id: string; name: string; rating: number; attribute: string; specialization: string; group: string }>();
  for (const group of skillGroups) {
    const rating = skillGroupRating(c, group.id);
    if (!rating) continue;
    for (const id of group.skills) {
      const skill = byId(skills, id);
      if (skill) rows.set(id, { id, name: skill.name, rating, attribute: skill.attribute, specialization: '', group: group.name });
    }
  }
  for (const skill of skills) {
    const rating = skillRating(c, skill.id);
    if (!rating) continue;
    rows.set(skill.id, {
      id: skill.id,
      name: skill.name,
      rating,
      attribute: skill.attribute,
      specialization: c.skills[skill.id]?.specialization ?? '',
      group: '',
    });
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

export function derive(c: Character) {
  const level = gameLevelOf(c);
  const metatype = metatypeOf(c);
  const prio = c.priorities;

  const natural = Object.fromEntries(CORE_ATTRIBUTES.map((key) => [key, naturalAttribute(c, key)])) as Record<CoreAttribute, number>;
  const bonus = Object.fromEntries(CORE_ATTRIBUTES.map((key) => [key, augmentationBonus(c, key)])) as Record<CoreAttribute, number>;
  const augmented = Object.fromEntries(CORE_ATTRIBUTES.map((key) => [key, natural[key] + bonus[key]])) as Record<CoreAttribute, number>;

  const essenceLost = essenceSpent(c);
  const essence = Math.round((CREATION_STARTING_ESSENCE - essenceLost) * 1000) / 1000;
  // Qualquer fração de Essência perdida custa um ponto inteiro de Magia/Ressonância.
  const essencePenalty = Math.ceil(Math.round(essenceLost * 1000) / 1000);

  const option = magicOptionOf(c);
  const edge = edgeBase(c) + c.special.edge.points + c.special.edge.karmaRanks;
  const magicNatural = isAwakened(c) ? (option?.magic ?? 0) + c.special.magic.points + c.special.magic.karmaRanks : 0;
  const resonanceNatural = isTechnomancer(c) ? (option?.resonance ?? 0) + c.special.resonance.points + c.special.resonance.karmaRanks : 0;
  const magic = Math.max(0, magicNatural - essencePenalty);
  const resonance = Math.max(0, resonanceNatural - essencePenalty);

  // --- Pontos ---
  const attributePool = prio.attributes ? priorities[prio.attributes].attributes : 0;
  const attributeSpent = CORE_ATTRIBUTES.reduce((sum, key) => sum + c.attributes[key].points, 0);
  const specialPool = prio.metatype && c.metatype ? (priorities[prio.metatype].metatypes[c.metatype] ?? 0) : 0;
  const specialSpent = c.special.edge.points + c.special.magic.points + c.special.resonance.points;

  const skillRow = prio.skills ? priorities[prio.skills].skills : { points: 0, groups: 0 };
  const skillSpecPoints = Object.values(c.skills).filter((s) => s.specialization && s.specBy === 'points').length;
  const skillPoints = Object.values(c.skills).reduce((sum, s) => sum + s.points, 0) + skillSpecPoints;
  const groupSpent = Object.values(c.skillGroups).reduce((sum, g) => sum + g.points, 0);

  const knowledgePool = (natural.intuition + natural.logic) * 2;
  const knowledgeLike = [...c.knowledge, ...c.languages.filter((l) => !l.native)];
  const knowledgeSpent = knowledgeLike.reduce(
    (sum, s) => sum + s.points + (s.specialization && s.specBy === 'points' ? 1 : 0),
    0,
  );
  // Pontos de perícia também podem pagar Conhecimento e Idioma.
  const knowledgeOverflow = Math.max(0, knowledgeSpent - knowledgePool);
  const skillSpent = skillPoints + knowledgeOverflow;

  // --- Carma ---
  const positive = c.qualities.filter((q) => byId(qualities, q.id)?.kind === 'positive');
  const negative = c.qualities.filter((q) => byId(qualities, q.id)?.kind === 'negative');
  const positiveKarma = positive.reduce((sum, q) => sum + qualityValue(q), 0);
  const negativeKarma = negative.reduce((sum, q) => sum + qualityValue(q), 0);

  const attributeKarma = CORE_ATTRIBUTES.reduce((sum, key) => {
    const from = (metatype?.attributes[key][0] ?? 1) + c.attributes[key].points;
    return sum + karmaCost(from, from + c.attributes[key].karmaRanks, 5);
  }, 0);
  const specialKarma =
    karmaCost(edgeBase(c) + c.special.edge.points, edge, 5) +
    (isAwakened(c) ? karmaCost(magicNatural - c.special.magic.karmaRanks, magicNatural, 5) : 0) +
    (isTechnomancer(c) ? karmaCost(resonanceNatural - c.special.resonance.karmaRanks, resonanceNatural, 5) : 0);

  const skillKarma = Object.entries(c.skills).reduce((sum, [id, s]) => {
    const from = freeSkillRating(c, id) + s.points;
    return sum + karmaCost(from, from + s.karmaRanks, 2) + (s.specialization && s.specBy === 'karma' ? SPECIALIZATION_KARMA : 0);
  }, 0);
  const groupKarma = Object.entries(c.skillGroups).reduce((sum, [id, g]) => {
    const rating = skillGroupRating(c, id);
    return sum + karmaCost(rating - g.karmaRanks, rating, 5);
  }, 0);
  const knowledgeKarma = knowledgeLike.reduce(
    (sum, s) => sum + karmaCost(s.points, s.points + s.karmaRanks, 1) + (s.specialization && s.specBy === 'karma' ? SPECIALIZATION_KARMA : 0),
    0,
  );

  const freeSpells = option?.spells ?? 0;
  const spellKarma = (Math.max(0, c.spells.length - freeSpells) + c.formulae.length) * SPELL_KARMA;
  const freeComplexForms = option?.complexForms ?? 0;
  const complexFormKarma = Math.max(0, c.complexForms.length - freeComplexForms) * COMPLEX_FORM_KARMA;
  const powerPointKarma = c.awakening.type === 'mysticAdept' ? c.awakening.powerPointsBought * POWER_POINT_KARMA : 0;
  const spiritKarma = c.spirits.reduce((sum, s) => sum + s.services, 0);
  const spriteKarma = c.sprites.reduce((sum, s) => sum + s.tasks, 0);
  const focusKarma = c.foci.reduce(
    (sum, f) => sum + f.force * (byId(magicData.focusTypes, f.type)?.bondMultiplier ?? 0),
    0,
  );

  const contactPool = natural.charisma * level.contactKarmaPerCharisma;
  const contactSpent = c.contacts.reduce((sum, k) => sum + k.connection + k.loyalty, 0);
  const contactKarma = Math.max(0, contactSpent - contactPool);

  const karmaLines = [
    { label: 'Qualidades positivas', value: -positiveKarma },
    { label: 'Qualidades negativas', value: negativeKarma },
    { label: 'Atributos', value: -attributeKarma },
    { label: 'Atributos especiais', value: -specialKarma },
    { label: 'Perícias Ativas', value: -skillKarma },
    { label: 'Grupos de perícias', value: -groupKarma },
    { label: 'Conhecimento e Idiomas', value: -knowledgeKarma },
    { label: 'Feitiços e fórmulas', value: -spellKarma },
    { label: 'Formas complexas', value: -complexFormKarma },
    { label: 'Pontos de Poder', value: -powerPointKarma },
    { label: 'Espíritos vinculados', value: -spiritKarma },
    { label: 'Sprites registrados', value: -spriteKarma },
    { label: 'Vínculo de focos', value: -focusKarma },
    { label: 'Contatos excedentes', value: -contactKarma },
    { label: 'Conversão em neoienes', value: -c.karmaToNuyen },
  ];
  const karmaRemaining = karmaLines.reduce((sum, line) => sum + line.value, level.karma);

  // --- Neoienes ---
  const lifestyle = byId(lifestyles, c.lifestyle.id) ?? lifestyles[0];
  const lifestyleCost = lifestyle.cost * (metatype?.lifestyleMultiplier ?? 1) * c.lifestyle.months;
  const gearCost = c.gear.reduce((sum, item) => sum + gearTotals(item).cost, 0);
  const programCost = c.programs.reduce((sum, id) => sum + (byId(programs, id)?.cost ?? 0), 0);
  const nuyenTotal = resourcesFor(c, prio.resources) + c.karmaToNuyen * KARMA_TO_NUYEN_RATE;
  const nuyenSpent = gearCost + programCost + lifestyleCost;
  const nuyenRemaining = nuyenTotal - nuyenSpent;
  const carriedNuyen = Math.min(MAX_CARRIED_NUYEN, Math.max(0, nuyenRemaining));
  const startingNuyen = carriedNuyen + c.lifestyle.startingRoll * lifestyle.multiplier;

  // --- Pontos de Poder ---
  const powerPoints = c.awakening.type === 'adept' ? magic : c.awakening.type === 'mysticAdept' ? c.awakening.powerPointsBought : 0;
  const powerPointsSpent = c.adeptPowers.reduce((sum, p) => sum + adeptPowerCost(p.id, p.rating), 0);

  // --- Limites ---
  const limitBonus: Record<LimitKey, number> = { physical: 0, mental: 0, social: 0 };
  for (const q of c.qualities) {
    if (q.id !== 'indomavel') continue;
    limitBonus.physical += q.limits.physical;
    limitBonus.mental += q.limits.mental;
    limitBonus.social += q.limits.social;
  }
  for (const p of c.adeptPowers) {
    if (p.id === 'potencial-melhorado' && p.choice in limitBonus) limitBonus[p.choice as LimitKey] += p.rating;
  }
  const a = augmented;
  const limits = {
    physical: Math.ceil((a.strength * 2 + a.body + a.reaction) / 3),
    mental: Math.ceil((a.logic * 2 + a.intuition + a.willpower) / 3),
    social: Math.ceil((a.charisma * 2 + a.willpower + Math.ceil(essence)) / 3),
  };
  const limitsNatural = {
    physical: Math.ceil((natural.strength * 2 + natural.body + natural.reaction) / 3),
    mental: Math.ceil((natural.logic * 2 + natural.intuition + natural.willpower) / 3),
    social: Math.ceil((natural.charisma * 2 + natural.willpower + 6) / 3),
  };

  // --- Combate ---
  const reflexes = c.adeptPowers.find((p) => p.id === 'reflexos-melhorados')?.rating ?? 0;
  const gearDice = c.gear.reduce((sum, item) => sum + item.initiativeDice * item.quantity, 0);
  const initiativeDice = Math.min(5, 1 + gearDice + reflexes);
  const willToLive = c.qualities.find((q) => q.id === 'desejo-de-viver')?.rating ?? 0;
  const armor = Math.max(0, ...c.gear.map((item) => item.armor)) + (metatype?.dermalArmor ?? 0);
  const persona = {
    attack: natural.charisma,
    sleaze: natural.intuition,
    dataProcessing: natural.logic,
    firewall: natural.willpower,
    deviceRating: resonance,
  };

  return {
    level,
    metatype,
    natural,
    bonus,
    augmented,
    edge,
    magicNatural,
    resonanceNatural,
    magic,
    resonance,
    essence,
    essencePenalty,
    option,
    points: {
      attributes: { pool: attributePool, spent: attributeSpent },
      special: { pool: specialPool, spent: specialSpent },
      skills: { pool: skillRow.points, spent: skillSpent },
      groups: { pool: skillRow.groups, spent: groupSpent },
      knowledge: { pool: knowledgePool, spent: knowledgeSpent },
      contacts: { pool: contactPool, spent: contactSpent },
      powerPoints: { pool: powerPoints, spent: powerPointsSpent },
    },
    karma: { start: level.karma, lines: karmaLines, remaining: karmaRemaining, positive: positiveKarma, negative: negativeKarma },
    nuyen: {
      total: nuyenTotal,
      spent: nuyenSpent,
      remaining: nuyenRemaining,
      carried: carriedNuyen,
      starting: startingNuyen,
      lifestyleCost,
      gearCost,
      programCost,
      lifestyle,
    },
    freeSpells,
    freeComplexForms,
    limits,
    limitsNatural,
    limitBonus,
    initiative: { natural: natural.intuition + natural.reaction, value: a.intuition + a.reaction, dice: initiativeDice },
    astralInitiative: { value: a.intuition * 2, dice: 2 },
    matrixAR: { value: a.intuition + a.reaction, dice: 1 },
    matrixCold: { value: persona.dataProcessing + a.intuition, dice: 3 },
    matrixHot: { value: persona.dataProcessing + a.intuition, dice: 4 },
    monitors: {
      physical: 8 + Math.ceil(a.body / 2),
      stun: 8 + Math.ceil(a.willpower / 2),
      overflow: a.body + willToLive,
    },
    composure: a.charisma + a.willpower,
    judgeIntentions: a.charisma + a.intuition,
    memory: a.logic + a.willpower,
    liftCarry: a.body + a.strength,
    movement: { walk: a.agility * 2, run: a.agility * 4, sprintPerHit: metatype?.sprintPerHit ?? 2 },
    armor,
    persona,
    drainResist: (() => {
      const tradition = byId(magicData.traditions, c.awakening.tradition);
      return tradition ? tradition.drain.reduce((sum, key) => sum + (a[key as CoreAttribute] ?? 0), 0) : 0;
    })(),
    fadeResist: a.willpower + resonance,
  };
}

export type Derived = ReturnType<typeof derive>;
