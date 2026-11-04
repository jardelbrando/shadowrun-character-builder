import { describe, expect, it } from 'vitest';
import { characterSchema, gearItemSchema, newCharacter, type Character } from '../schema/character';
import { parseCharacter, serializeCharacter } from '../schema/io';
import catalogJson from '../data/catalog.json';
import { setAwakeningType, toggleFreeSkill } from './actions';
import { buildGearItem, capacityUsed, rebuildGearItem, removeGearItem, weaponDamage, type CatalogEntry } from './catalog';
import { CORE_ATTRIBUTES, glossary, skillGroups, skills } from '../data';
import { derive, karmaCost, skillRating } from './derive';
import { stepCorp, watcherCorp } from './megacorp';
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

  it('perícia gratuita devolve os pontos já gastos sem baixar o nível', () => {
    const c = newCharacter();
    c.priorities = { metatype: 'C', attributes: 'B', magicResonance: 'A', skills: 'D', resources: 'E' };
    c.metatype = 'elf';
    c.awakening.type = 'mage';
    const entry = (points: number) => ({ points, karmaRanks: 0, specialization: '', specBy: 'points' as const });
    c.skills = { conjuracao: entry(6), contramagica: entry(5), invocacao: entry(6), arcana: entry(4), alquimia: entry(1) };
    expect(derive(c).points.skills).toEqual({ pool: 22, spent: 22 });

    toggleFreeSkill(c, 'conjuracao');
    toggleFreeSkill(c, 'contramagica');
    toggleFreeSkill(c, 'invocacao');

    expect(c.awakening.freeSkills).toEqual(['conjuracao', 'contramagica']);
    expect(skillRating(c, 'conjuracao')).toBe(6);
    expect(skillRating(c, 'contramagica')).toBe(5);
    expect(derive(c).points.skills.spent).toBe(12);
    expect(validate(c, derive(c)).some((i) => i.message.startsWith('Escolha 2 perícia'))).toBe(false);
  });

  it('trocar o tipo de personagem limpa as perícias gratuitas', () => {
    const c = newCharacter();
    c.awakening.type = 'mage';
    c.awakening.freeSkills = ['conjuracao'];
    setAwakeningType(c, 'technomancer');
    expect(c.awakening.freeSkills).toEqual([]);
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

describe('megacorps', () => {
  it('magia aponta para a Wuxing em todos os tipos de Desperto', () => {
    const c = newCharacter();
    for (const type of ['mage', 'adept', 'mysticAdept', 'aspected'] as const) {
      c.awakening.type = type;
      expect(stepCorp(c, 'magic').id).toBe('wuxing');
      expect(watcherCorp(c).id).toBe('wuxing');
    }
  });

  it('tecnomantes atraem a NeoNET, e ampliações mudam a etapa de recursos', () => {
    const c = newCharacter();
    expect(stepCorp(c, 'resources').id).toBe('ares');
    c.gear = [gearItemSchema.parse({ id: '1', name: 'X', essence: 0.5 })];
    expect(stepCorp(c, 'resources').id).toBe('neonet');
    c.gear = [];
    c.awakening.type = 'technomancer';
    expect(watcherCorp(c).id).toBe('neonet');
  });

  it('meta-tipos não humanos atraem a Evo', () => {
    const c = newCharacter();
    c.metatype = 'troll';
    expect(stepCorp(c, 'priorities').id).toBe('evo');
  });
});

describe('glossário', () => {
  it('explica todos os atributos, perícias e grupos', () => {
    const ids = [
      ...CORE_ATTRIBUTES.map((key) => `attr:${key}`),
      'attr:edge',
      'attr:essence',
      'attr:magic',
      'attr:resonance',
      ...skills.map((skill) => `skill:${skill.id}`),
      ...skillGroups.map((group) => `group:${group.id}`),
    ];
    expect(ids.filter((id) => !glossary[id])).toEqual([]);
  });

  it('todos os termos usados no código existem', () => {
    const entries = Object.values(glossary);
    expect(entries.every((entry) => entry.title && entry.kind && entry.body)).toBe(true);
    expect(Object.keys(glossary).filter((id) => id.startsWith('skill:') && glossary[id].default === undefined)).toEqual([]);
  });
});

describe('catálogo', () => {
  const catalog = catalogJson as CatalogEntry[];
  const entry = (id: string) => catalog.find((item) => item.id === id)!;

  it('todo item tem descrição, nome e custo válido', () => {
    expect(catalog.filter((item) => !item.desc || !item.name || !item.section).map((item) => item.id)).toEqual([]);
    expect(new Set(catalog.map((item) => item.id)).size).toBe(catalog.length);
  });

  it('traz valores da tabela do livro', () => {
    expect(entry('ares-predator-v')).toMatchObject({ cost: [725, 0], avail: [5, 0], restriction: 'R', weapon: { acc: '5 (7)', dv: '8F', ap: '–1' } });
    expect(entry('katana')).toMatchObject({ cost: [1000, 0], weapon: { reach: 1, dv: '(FOR + 3)F', ap: '–3' } });
    expect(entry('jaqueta-blindada')).toMatchObject({ armor: 12, cost: [1000, 0] });
    expect(entry('ciber-olhos').levels?.[3]).toMatchObject({ cost: 14000, essence: 0.5, give: 16, avail: 12 });
  });

  it('melhorias de Reação 2 do exemplo de Beto: custo, Essência e novos cálculos', () => {
    const c = newCharacter();
    c.metatype = 'troll';
    c.gear = [buildGearItem('1', entry('melhorias-de-reacao'), { rating: 2 })];
    const d = derive(c);
    expect(c.gear[0].unitCost).toBe(26000);
    expect(d.essence).toBeCloseTo(5.4);
    expect(d.bonus.reaction).toBe(2);
    expect(d.augmented.reaction).toBe(3);
  });

  it('reflexos cabeados somam Reação e dados de Iniciativa', () => {
    const c = newCharacter();
    c.gear = [buildGearItem('1', entry('reflexos-cabeados'), { rating: 2 })];
    const d = derive(c);
    expect(c.gear[0].unitCost).toBe(149000);
    expect(d.essence).toBe(3);
    expect(d.bonus.reaction).toBe(2);
    expect(d.initiative.dice).toBe(3);
  });

  it('alphaware aplica a classe sobre o Nível', () => {
    const c = newCharacter();
    c.gear = [buildGearItem('1', entry('reflexos-cabeados'), { rating: 1, grade: 'alpha' })];
    const d = derive(c);
    expect(d.essence).toBeCloseTo(4.4);
    expect(d.nuyen.gearCost).toBe(46800);
  });

  it('item dentro de cibermembro usa Capacidade, não Essência', () => {
    const c = newCharacter();
    const arm = buildGearItem('b', entry('braco-completo-obvio'));
    const mod = buildGearItem('m', entry('melhoria-forca'), { rating: 3, parent: arm });
    c.gear = [arm, mod];
    expect(derive(c).essence).toBe(5);
    expect(capacityUsed(c, 'b')).toBe(3);
    c.gear.push(buildGearItem('x', entry('ciber-arma-pistola-pesada'), { parent: arm }), buildGearItem('y', entry('ciber-arma-submetralhadora'), { parent: arm }));
    expect(capacityUsed(c, 'b')).toBe(17);
    expect(validate(c, derive(c)).some((i) => i.message.includes('Capacidade usada'))).toBe(true);
    removeGearItem(c, 'b');
    expect(c.gear).toEqual([]);
  });

  it('armadura soma capacete e ampliações, mas só a melhor peça base', () => {
    const c = newCharacter();
    c.metatype = 'human';
    c.gear = [buildGearItem('1', entry('jaqueta-blindada')), buildGearItem('2', entry('colete-blindado')), buildGearItem('3', entry('capacete')), buildGearItem('4', entry('couraca-dermica'), { rating: 2 })];
    expect(derive(c).armor).toBe(16);
  });

  it('acessórios no mesmo suporte e ampliações incompatíveis são recusados', () => {
    const c = newCharacter();
    const gun = buildGearItem('g', entry('ares-predator-v'));
    c.gear = [gun, buildGearItem('a', entry('silenciador-supressor'), { parent: gun }), buildGearItem('b', entry('sistema-de-saida-de-gas'), { rating: 1, parent: gun })];
    expect(validate(c, derive(c)).some((i) => i.message.includes('dois acessórios'))).toBe(true);
    c.gear = [buildGearItem('1', entry('couraca-dermica'), { rating: 1 }), buildGearItem('2', entry('ortopele'), { rating: 1 })];
    expect(validate(c, derive(c)).some((i) => i.message.includes('não podem ser combinados'))).toBe(true);
  });

  it('arma inteligente interna dobra o custo da arma', () => {
    const gun = buildGearItem('g', entry('colt-america-l36'));
    const smart = buildGearItem('s', entry('sistema-de-arma-inteligente-interno'), { parent: gun });
    expect(smart.unitCost).toBe(320);
    expect(smart.availability).toBe(6);
  });

  it('mudar o Nível recalcula o item', () => {
    const item = buildGearItem('1', entry('ortopele'), { rating: 1, quantity: 1 });
    const next = rebuildGearItem(item, entry('ortopele'), 3, 'alpha');
    expect(next).toMatchObject({ id: '1', rating: 3, unitCost: 18000, armorBonus: 3, grade: 'alpha' });
  });

  it('calcula dano com Força', () => {
    expect(weaponDamage('(FOR + 3)F', 5)).toBe('8F');
    expect(weaponDamage('8F', 5)).toBe('8F');
  });
});
