import { describe, expect, it } from 'vitest';
import { characterSchema, gearItemSchema, newCharacter, type Character } from '../schema/character';
import { parseCharacter, serializeCharacter } from '../schema/io';
import { derive, karmaCost } from './derive';
import { validate } from './validate';

type Points = Partial<Record<keyof Character['attributes'], number>>;

function build(setup: (c: Character) => void, points: Points) {
  const c = newCharacter();
  for (const [key, value] of Object.entries(points)) c.attributes[key as keyof Points].points = value;
  setup(c);
  return characterSchema.parse(c);
}

// Exemplos da Seção 3 do livro (pp. 66-102).
const jefferson = () =>
  build(
    (c) => {
      c.priorities = { metatype: 'D', attributes: 'C', magicResonance: 'B', skills: 'E', resources: 'A' };
      c.metatype = 'human';
      c.special.edge.points = 1;
      c.special.resonance.points = 2;
      c.awakening.type = 'technomancer';
      c.awakening.freeSkills = ['compilar', 'registrar'];
      c.complexForms = ['limpador', 'editor', 'ferrao-de-ressonancia'];
      c.qualities = [
        { id: 'mente-analitica', rating: 1, option: '', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'endurecimento-natural', rating: 1, option: '', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'resistencia-a-patogenos-toxinas', rating: 1, option: 'Patógenos ou toxinas', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'vicio', rating: 1, option: 'Moderado', note: 'MQTs', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'dependentes', rating: 1, option: 'Nível 6', note: 'namorada', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'preconceituoso', rating: 1, option: 'Grupo comum, Inclinado', note: 'Escravos de aluguel', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
      ];
      c.skills = {
        automaticas: { points: 2, karmaRanks: 0, specialization: '', specBy: 'points' },
        computador: { points: 3, karmaRanks: 0, specialization: '', specBy: 'points' },
        'guerra-eletronica': { points: 1, karmaRanks: 1, specialization: '', specBy: 'points' },
        falsificacao: { points: 2, karmaRanks: 0, specialization: '', specBy: 'points' },
        hackear: { points: 5, karmaRanks: 0, specialization: '', specBy: 'points' },
        hardware: { points: 1, karmaRanks: 0, specialization: '', specBy: 'points' },
        percepcao: { points: 2, karmaRanks: 0, specialization: '', specBy: 'points' },
        pistolas: { points: 2, karmaRanks: 0, specialization: '', specBy: 'points' },
        cibercombate: { points: 0, karmaRanks: 2, specialization: '', specBy: 'points' },
        software: { points: 0, karmaRanks: 2, specialization: '', specBy: 'points' },
      };
      c.sprites = [
        { id: '1', type: 'Dados', tasks: 3 },
        { id: '2', type: 'Defeito', tasks: 3 },
      ];
      c.contacts = [
        { id: '1', name: 'Tenente', role: '', connection: 2, loyalty: 2 },
        { id: '2', name: 'Receptador', role: '', connection: 1, loyalty: 1 },
        { id: '3', name: 'Atravessador', role: '', connection: 2, loyalty: 1 },
      ];
    },
    { body: 2, agility: 1, reaction: 1, strength: 2, charisma: 2, intuition: 3, logic: 3, willpower: 2 },
  );

const beto = () =>
  build(
    (c) => {
      c.priorities = { metatype: 'B', attributes: 'A', magicResonance: 'E', skills: 'C', resources: 'D' };
      c.metatype = 'troll';
      c.karmaToNuyen = 10;
      c.qualities = [
        { id: 'atributo-excepcional', rating: 1, option: '', note: '', attribute: 'strength', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'desejo-de-viver', rating: 1, option: '', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
      ];
      c.gear = [
        gearItemSchema.parse({ id: '1', name: 'Melhorias de reação 2', unitCost: 26000, attributeBonuses: { reaction: 2 } }),
      ];
      c.lifestyle = { id: 'low', months: 3, startingRoll: 12 };
    },
    { body: 4, agility: 3, reaction: 2, strength: 6, charisma: 2, intuition: 2, logic: 2, willpower: 3 },
  );

const clara = () =>
  build(
    (c) => {
      c.priorities = { metatype: 'D', attributes: 'B', magicResonance: 'A', skills: 'C', resources: 'E' };
      c.metatype = 'elf';
      c.karmaToNuyen = 10;
      c.awakening = { type: 'mysticAdept', tradition: 'shamanic', freeSkills: ['conjuracao', 'contramagica'], freeSkillGroup: '', mentorSpirit: 'mar', powerPointsBought: 2 };
      c.adeptPowers = [{ id: 'potencial-melhorado', rating: 1, choice: 'social' }];
      c.spirits = [
        { id: '1', type: 'Água', services: 4 },
        { id: '2', type: 'Feras', services: 4 },
      ];
      c.skills = { etiqueta: { points: 2, karmaRanks: 1, specialization: '', specBy: 'points' } };
      c.qualities = [
        { id: 'espirito-mentor', rating: 1, option: '', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'concentracao-focada', rating: 2, option: '', note: '', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'codigo-de-honra', rating: 1, option: '', note: 'Elfos', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'estilo-distinto', rating: 1, option: '', note: 'Tatuagens', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
        { id: 'vicio', rating: 1, option: 'Menor', note: 'Glória', attribute: '', limits: { physical: 0, mental: 0, social: 0 } },
      ];
    },
    { body: 2, agility: 4, reaction: 2, strength: 1, charisma: 3, intuition: 3, logic: 2, willpower: 3 },
  );

describe('exemplos do livro', () => {
  it('Jefferson: cálculos finais e Carma', () => {
    const d = derive(jefferson());
    expect(d.points.attributes).toEqual({ pool: 16, spent: 16 });
    expect(d.points.special).toEqual({ pool: 3, spent: 3 });
    expect(d.resonance).toBe(6);
    expect(d.edge).toBe(3);
    expect(d.limits).toEqual({ physical: 4, mental: 5, social: 5 });
    expect(d.monitors).toEqual({ physical: 10, stun: 10, overflow: 3 });
    expect(d.initiative).toMatchObject({ value: 6, dice: 1 });
    expect(d.points.knowledge.pool).toBe(16);
    expect(d.points.contacts).toEqual({ pool: 9, spent: 9 });
    expect(d.karma.remaining).toBe(0);
    expect(d.persona).toMatchObject({ attack: 3, firewall: 3, deviceRating: 6 });
  });

  it('Beto: troll com ampliação, Atributo Excepcional e Estilo de Vida dobrado', () => {
    const c = beto();
    const d = derive(c);
    expect(d.natural.strength).toBe(11);
    expect(d.points.attributes).toEqual({ pool: 24, spent: 24 });
    expect(d.limits).toEqual({ physical: 12, mental: 5, social: 6 });
    expect(d.monitors).toEqual({ physical: 13, stun: 10, overflow: 10 });
    expect(d.initiative).toMatchObject({ natural: 6, value: 8, dice: 1 });
    expect(d.nuyen.total).toBe(70000);
    expect(d.nuyen.lifestyleCost).toBe(12000);
    expect(validate(c, d).some((i) => i.message.startsWith('Só um atributo'))).toBe(false);
  });

  it('Clara: adepta mística com Pontos de Poder comprados', () => {
    const d = derive(clara());
    expect(d.points.attributes).toEqual({ pool: 20, spent: 20 });
    expect(d.magic).toBe(6);
    expect(d.points.powerPoints.pool).toBe(2);
    expect(d.points.knowledge.pool).toBe(14);
    expect(d.points.contacts.pool).toBe(18);
    expect(d.limits).toEqual({ physical: 4, mental: 5, social: 8 });
    expect(d.limitBonus.social).toBe(1);
    expect(d.monitors).toEqual({ physical: 10, stun: 10, overflow: 3 });
    // 25 + 24 - 13 de qualidades - 10 de PP - 10 de neoienes - 6 de Etiqueta - 8 de espíritos
    expect(d.karma.remaining).toBe(2);
  });
});

describe('regras', () => {
  it('custo de Carma é cumulativo', () => {
    expect(karmaCost(4, 5, 5)).toBe(25);
    expect(karmaCost(4, 6, 5)).toBe(55);
    expect(karmaCost(0, 3, 2)).toBe(12);
    expect(karmaCost(7, 8, 2)).toBe(16);
  });

  it('qualquer fração de Essência perdida reduz a Magia em 1', () => {
    const c = clara();
    c.gear = [gearItemSchema.parse({ id: '1', name: 'Ciber-olhos', essence: 0.5 })];
    const once = derive(c);
    expect(once.essence).toBe(5.5);
    expect(once.magic).toBe(5);
    c.gear[0].essence = 1;
    expect(derive(c).magic).toBe(5);
    c.gear[0].essence = 1.1;
    expect(derive(c).magic).toBe(4);
  });

  it('Alphaware aplica os multiplicadores de Essência, custo e Disponibilidade', () => {
    const c = newCharacter();
    c.gear = [gearItemSchema.parse({ id: '1', name: 'X', essence: 1, unitCost: 1000, grade: 'alpha' })];
    const d = derive(c);
    expect(d.essence).toBe(5.2);
    expect(d.nuyen.gearCost).toBe(1200);
  });

  it('o Limite Social arredonda a Essência para cima', () => {
    const c = newCharacter();
    c.gear = [gearItemSchema.parse({ id: '1', name: 'X', essence: 0.1 })];
    expect(derive(c).limits.social).toBe(derive(newCharacter()).limits.social);
  });

  it('níveis de jogo mudam recursos e limites', () => {
    const c = newCharacter();
    c.gameLevel = 'street';
    c.priorities.resources = 'A';
    const d = derive(c);
    expect(d.nuyen.total).toBe(75000);
    expect(d.karma.start).toBe(13);
  });

  it('rejeita prioridade repetida e meta-tipo indisponível', () => {
    const c = newCharacter();
    c.priorities = { metatype: 'E', attributes: 'E', magicResonance: 'A', skills: 'B', resources: 'C' };
    c.metatype = 'troll';
    const messages = validate(c, derive(c)).map((i) => i.message);
    expect(messages).toContain('Cada nível de prioridade só pode ser usado uma vez.');
    expect(messages.some((m) => m.includes('não está disponível na prioridade E'))).toBe(true);
  });

  it('exportar e importar preserva o personagem', () => {
    const c = clara();
    const result = parseCharacter(serializeCharacter(c));
    expect(result).toEqual({ ok: true, character: c });
  });

  it('importação recusa JSON inválido', () => {
    expect(parseCharacter('{').ok).toBe(false);
    expect(parseCharacter('{"schemaVersion":99}').ok).toBe(false);
  });
});
