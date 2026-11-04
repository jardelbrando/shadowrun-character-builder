// Todas as regras do livro vivem em JSON. Este módulo só dá tipos a elas.
import prioritiesJson from './priorities.json';
import metatypesJson from './metatypes.json';
import gameLevelsJson from './gameLevels.json';
import skillsJson from './skills.json';
import qualitiesJson from './qualities.json';
import spellsJson from './spells.json';
import complexFormsJson from './complexForms.json';
import adeptPowersJson from './adeptPowers.json';
import programsJson from './programs.json';
import magicJson from './magic.json';
import lifestylesJson from './lifestyles.json';

export const PRIORITY_LEVELS = ['A', 'B', 'C', 'D', 'E'] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const PRIORITY_COLUMNS = ['metatype', 'attributes', 'magicResonance', 'skills', 'resources'] as const;
export type PriorityColumn = (typeof PRIORITY_COLUMNS)[number];

export const PHYSICAL_ATTRIBUTES = ['body', 'agility', 'reaction', 'strength'] as const;
export const MENTAL_ATTRIBUTES = ['willpower', 'logic', 'intuition', 'charisma'] as const;
export const CORE_ATTRIBUTES = [...PHYSICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES] as const;
export type CoreAttribute = (typeof CORE_ATTRIBUTES)[number];

export const ATTRIBUTE_NAMES: Record<string, string> = {
  body: 'Corpo',
  agility: 'Agilidade',
  reaction: 'Reação',
  strength: 'Força',
  willpower: 'Vontade',
  logic: 'Lógica',
  intuition: 'Intuição',
  charisma: 'Carisma',
  edge: 'Trunfo',
  magic: 'Magia',
  resonance: 'Ressonância',
};

export const LIMIT_NAMES = { physical: 'Físico', mental: 'Mental', social: 'Social' } as const;
export type LimitKey = keyof typeof LIMIT_NAMES;

export const AWAKENING_TYPES = ['none', 'mage', 'mysticAdept', 'adept', 'aspected', 'technomancer'] as const;
export type AwakeningType = (typeof AWAKENING_TYPES)[number];

export const AWAKENING_NAMES: Record<AwakeningType, string> = {
  none: 'Mundano',
  mage: 'Mago',
  mysticAdept: 'Adepto Místico',
  adept: 'Adepto',
  aspected: 'Mago de Aspecto',
  technomancer: 'Tecnomante',
};

export interface MagicOption {
  magic?: number;
  resonance?: number;
  skills?: { count: number; rating: number; kind: 'magic' | 'resonance' | 'active' } | null;
  skillGroup?: { rating: number } | null;
  spells?: number;
  complexForms?: number;
}

export interface PriorityRow {
  metatypes: Record<string, number>;
  attributes: number;
  magic: Partial<Record<AwakeningType, MagicOption>>;
  skills: { points: number; groups: number };
  resources: number;
}

export interface Metatype {
  id: string;
  name: string;
  attributes: Record<CoreAttribute | 'edge', [number, number]>;
  racial: string[];
  lifestyleMultiplier: number;
  sprintPerHit: number;
  dermalArmor: number;
}

export interface GameLevel {
  id: string;
  name: string;
  karma: number;
  qualityLimit: number;
  maxDeviceRating: number;
  maxAvailability: number;
  maxKarmaToNuyen: number;
  contactKarmaPerCharisma: number;
  resources: Record<PriorityLevel, number> | null;
}

export interface Skill {
  id: string;
  name: string;
  attribute: string;
  restricted?: 'magic' | 'resonance' | 'astral';
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
  restricted?: 'magic' | 'resonance';
}

export interface Quality {
  id: string;
  name: string;
  kind: 'positive' | 'negative';
  cost: number;
  summary: string;
  maxRating?: number;
  options?: { label: string; cost: number }[];
  requires?: { awakened?: boolean; magic?: boolean; casterOrTechnomancer?: boolean; metatypes?: string[] };
  incompatible?: string[];
  gmApproval?: boolean;
  repeatable?: boolean;
  needsNote?: string;
  choice?: 'attribute' | 'mentor' | 'limits';
}

export interface Spell {
  id: string;
  name: string;
  category: string;
  tags: string[];
  type: string;
  range: string;
  damage: string | null;
  duration: string;
  drain: string;
}

export interface ComplexForm {
  id: string;
  name: string;
  target: string;
  duration: string;
  fade: string;
}

export interface AdeptPower {
  id: string;
  name: string;
  cost: number;
  perRating?: boolean;
  costByRating?: number[];
  maxRating?: number;
  repeatable?: boolean;
  choice?: 'physicalAttribute' | 'skill' | 'limit';
}

export interface Program {
  id: string;
  name: string;
  kind: 'common' | 'hacking';
  availability: string | null;
  cost: number;
}

export const priorities = prioritiesJson as unknown as Record<PriorityLevel, PriorityRow>;
export const metatypes = metatypesJson as unknown as Metatype[];
export const gameLevels = gameLevelsJson as GameLevel[];
export const skills = skillsJson.skills as Skill[];
export const skillGroups = skillsJson.groups as SkillGroup[];
export const knowledgeCategories = skillsJson.knowledgeCategories;
export const qualities = qualitiesJson as Quality[];
export const spells = spellsJson as Spell[];
export const complexForms = complexFormsJson as ComplexForm[];
export const adeptPowers = adeptPowersJson as AdeptPower[];
export const programs = programsJson as Program[];
export const magicData = magicJson;
export const lifestyles = lifestylesJson.lifestyles;
export const grades = lifestylesJson.grades;
export const gearCategories = lifestylesJson.gearCategories;

export const SPELL_CATEGORY_NAMES: Record<string, string> = {
  combate: 'Combate',
  deteccao: 'Detecção',
  ilusao: 'Ilusão',
  manipulacao: 'Manipulação',
  saude: 'Saúde',
};

export const byId = <T extends { id: string }>(list: T[], id: string | null | undefined) =>
  list.find((item) => item.id === id);
