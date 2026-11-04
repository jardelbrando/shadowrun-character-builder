import { z } from 'zod';
import {
  AWAKENING_TYPES,
  CORE_ATTRIBUTES,
  PRIORITY_LEVELS,
  type CoreAttribute,
} from '../data';

/**
 * O personagem exportado guarda só as escolhas do jogador.
 * Valores derivados (Iniciativa, limites, Essência...) vêm de engine/derive.ts.
 * Mudou o formato? Suba SCHEMA_VERSION e adicione uma migração em schema/io.ts.
 */
export const SCHEMA_VERSION = 1;

const rank = z.number().int().min(0).max(99).default(0);
const priority = z.enum(PRIORITY_LEVELS).nullable().default(null);

const purchased = z.object({ points: rank, karmaRanks: rank });

const specialization = {
  specialization: z.string().default(''),
  specBy: z.enum(['points', 'karma']).default('points'),
};

const skillEntry = purchased.extend(specialization);

const knowledgeSkill = purchased.extend({
  id: z.string(),
  name: z.string().default(''),
  category: z.enum(['academic', 'interests', 'professional', 'street']).default('street'),
  ...specialization,
});

const languageSkill = purchased.extend({
  id: z.string(),
  name: z.string().default(''),
  native: z.boolean().default(false),
  ...specialization,
});

export const qualityEntrySchema = z.object({
  id: z.string(),
  rating: z.number().int().min(1).default(1),
  option: z.string().default(''),
  note: z.string().default(''),
  /** Atributo de Atributo Excepcional. */
  attribute: z.string().default(''),
  /** Distribuição de Indomável entre os limites. */
  limits: z
    .object({ physical: rank, mental: rank, social: rank })
    .default({ physical: 0, mental: 0, social: 0 }),
});

const adeptPowerEntry = z.object({
  id: z.string(),
  rating: z.number().int().min(1).default(1),
  /** Perícia, atributo físico ou limite escolhido para o poder. */
  choice: z.string().default(''),
});

export const gearItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  category: z.string().default('Outros'),
  quantity: z.number().int().min(1).default(1),
  unitCost: z.number().min(0).default(0),
  availability: z.number().int().min(0).default(0),
  restriction: z.enum(['', 'R', 'P']).default(''),
  deviceRating: z.number().int().min(0).default(0),
  essence: z.number().min(0).default(0),
  grade: z.enum(['standard', 'alpha']).default('standard'),
  armor: z.number().int().min(0).default(0),
  initiativeDice: z.number().int().min(0).default(0),
  attributeBonuses: z.partialRecord(z.enum(CORE_ATTRIBUTES), z.number().int()).default({}),
  notes: z.string().default(''),
  // Campos abaixo vêm do catálogo; itens personalizados ficam com os valores padrão.
  catalogId: z.string().default(''),
  rating: z.number().int().min(0).default(0),
  parentId: z.string().default(''),
  armorBonus: z.number().int().min(0).default(0),
  limitBonuses: z.partialRecord(z.enum(['physical', 'mental', 'social']), z.number().int()).default({}),
  lifestyleBonus: z.number().min(0).default(0),
  capacityGiven: z.number().int().min(0).default(0),
  capacityUsed: z.number().int().min(0).default(0),
  mount: z.string().default(''),
  modGroup: z.string().default(''),
  augType: z.enum(['', 'cyber', 'bio']).default(''),
  exclusive: z.string().default(''),
  weapon: z
    .object({
      type: z.enum(['melee', 'ranged', 'thrown']),
      acc: z.string(),
      dv: z.string(),
      ap: z.string(),
      reach: z.number().optional(),
      mode: z.string().optional(),
      rc: z.string().optional(),
      ammo: z.string().optional(),
    })
    .nullable()
    .default(null),
});

const contact = z.object({
  id: z.string(),
  name: z.string().default(''),
  role: z.string().default(''),
  connection: z.number().int().min(1).default(1),
  loyalty: z.number().int().min(1).default(1),
});

const attributes = Object.fromEntries(CORE_ATTRIBUTES.map((key) => [key, purchased.default({ points: 0, karmaRanks: 0 })])) as Record<
  CoreAttribute,
  z.ZodDefault<typeof purchased>
>;

export const characterSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  gameLevel: z.enum(['street', 'experienced', 'prime']).default('experienced'),
  personal: z
    .object({
      alias: z.string().default(''),
      realName: z.string().default(''),
      player: z.string().default(''),
      concept: z.string().default(''),
      ethnicity: z.string().default(''),
      age: z.string().default(''),
      sex: z.string().default(''),
      height: z.string().default(''),
      weight: z.string().default(''),
      streetCred: z.number().int().default(0),
      notoriety: z.number().int().default(0),
      publicAwareness: z.number().int().default(0),
      background: z.string().default(''),
      notes: z.string().default(''),
    })
    .prefault({}),
  priorities: z
    .object({ metatype: priority, attributes: priority, magicResonance: priority, skills: priority, resources: priority })
    .prefault({}),
  metatype: z.string().nullable().default(null),
  attributes: z.object(attributes).prefault({}),
  special: z
    .object({
      edge: purchased.prefault({}),
      magic: purchased.prefault({}),
      resonance: purchased.prefault({}),
    })
    .prefault({}),
  awakening: z
    .object({
      type: z.enum(AWAKENING_TYPES).default('none'),
      tradition: z.string().default(''),
      freeSkills: z.array(z.string()).default([]),
      freeSkillGroup: z.string().default(''),
      mentorSpirit: z.string().default(''),
      powerPointsBought: rank,
    })
    .prefault({}),
  qualities: z.array(qualityEntrySchema).default([]),
  skills: z.record(z.string(), skillEntry).default({}),
  skillGroups: z.record(z.string(), purchased).default({}),
  knowledge: z.array(knowledgeSkill).default([]),
  languages: z.array(languageSkill).default([]),
  spells: z.array(z.string()).default([]),
  formulae: z
    .array(z.object({ id: z.string(), kind: z.enum(['ritual', 'preparation']).default('ritual'), name: z.string().default('') }))
    .default([]),
  complexForms: z.array(z.string()).default([]),
  adeptPowers: z.array(adeptPowerEntry).default([]),
  programs: z.array(z.string()).default([]),
  spirits: z.array(z.object({ id: z.string(), type: z.string().default(''), services: z.number().int().min(1).default(1) })).default([]),
  sprites: z.array(z.object({ id: z.string(), type: z.string().default(''), tasks: z.number().int().min(1).default(1) })).default([]),
  foci: z
    .array(z.object({ id: z.string(), type: z.string().default('weapon'), force: z.number().int().min(1).default(1), name: z.string().default('') }))
    .default([]),
  gear: z.array(gearItemSchema).default([]),
  lifestyle: z
    .object({ id: z.string().default('street'), months: z.number().int().min(1).default(1), startingRoll: rank })
    .prefault({}),
  karmaToNuyen: rank,
  contacts: z.array(contact).default([]),
});

export type Character = z.infer<typeof characterSchema>;
export type GearItem = Character['gear'][number];
export type Contact = Character['contacts'][number];
export type QualityEntry = Character['qualities'][number];
export type KnowledgeSkill = Character['knowledge'][number];
export type LanguageSkill = Character['languages'][number];

export const newCharacter = (): Character => characterSchema.parse({ schemaVersion: SCHEMA_VERSION });
