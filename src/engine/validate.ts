import {
  ATTRIBUTE_NAMES,
  CORE_ATTRIBUTES,
  PRIORITY_COLUMNS,
  byId,
  magicData,
  priorities,
  qualities,
  skillGroups,
  skills,
} from '../data';
import type { Character } from '../schema/character';
import {
  MAX_AUGMENTATION_BONUS,
  MAX_CARRIED_KARMA,
  MAX_CARRIED_NUYEN,
  attributeMax,
  edgeMax,
  gearTotals,
  hasQuality,
  isAdept,
  isAwakened,
  isCaster,
  isTechnomancer,
  qualityValue,
  skillGroupRating,
  skillRating,
  specialMax,
  type Derived,
} from './derive';

export const STEP_IDS = ['concept', 'priorities', 'magic', 'qualities', 'skills', 'resources', 'karma', 'final', 'touches'] as const;
export type StepId = (typeof STEP_IDS)[number];

export interface Issue {
  step: StepId;
  severity: 'error' | 'warning';
  message: string;
}

const CREATION_SKILL_MAX = 6;

export function validate(c: Character, d: Derived): Issue[] {
  const issues: Issue[] = [];
  const error = (step: StepId, message: string) => issues.push({ step, severity: 'error', message });
  const warn = (step: StepId, message: string) => issues.push({ step, severity: 'warning', message });

  // Etapa 1
  if (!c.personal.concept.trim()) warn('concept', 'Defina o conceito do personagem.');

  // Etapa 2: prioridades, meta-tipo e atributos
  const chosen = PRIORITY_COLUMNS.map((column) => c.priorities[column]).filter(Boolean);
  if (chosen.length < PRIORITY_COLUMNS.length) error('priorities', 'Escolha uma prioridade para cada coluna.');
  if (new Set(chosen).size !== chosen.length) error('priorities', 'Cada nível de prioridade só pode ser usado uma vez.');

  if (!c.metatype) {
    error('priorities', 'Escolha um meta-tipo.');
  } else if (c.priorities.metatype && priorities[c.priorities.metatype].metatypes[c.metatype] === undefined) {
    error('priorities', `${d.metatype?.name} não está disponível na prioridade ${c.priorities.metatype}.`);
  }

  const attributeLeft = d.points.attributes.pool - d.points.attributes.spent;
  if (attributeLeft > 0) error('priorities', `Faltam gastar ${attributeLeft} pontos de atributo.`);
  if (attributeLeft < 0) error('priorities', `${-attributeLeft} pontos de atributo gastos a mais.`);

  const specialLeft = d.points.special.pool - d.points.special.spent;
  if (specialLeft < 0) error('priorities', `${-specialLeft} pontos de Atributo Especial gastos a mais.`);
  if (specialLeft > 0) warn('priorities', `${specialLeft} pontos de Atributo Especial sem uso serão perdidos.`);

  const atNaturalMax = CORE_ATTRIBUTES.filter((key) => d.natural[key] >= attributeMax(c, key));
  if (atNaturalMax.length > 1) {
    error('priorities', `Só um atributo pode estar no limite máximo natural (${atNaturalMax.map((k) => ATTRIBUTE_NAMES[k]).join(', ')}).`);
  }
  for (const key of CORE_ATTRIBUTES) {
    if (d.natural[key] > attributeMax(c, key)) error('priorities', `${ATTRIBUTE_NAMES[key]} acima do limite máximo.`);
    if (d.bonus[key] > MAX_AUGMENTATION_BONUS) error('resources', `${ATTRIBUTE_NAMES[key]}: ampliações limitadas a +${MAX_AUGMENTATION_BONUS}.`);
  }
  if (d.edge > edgeMax(c)) error('priorities', 'Trunfo acima do limite máximo.');

  // Etapa 3: magia ou ressonância
  const type = c.awakening.type;
  if (type !== 'none') {
    if (!d.option) {
      error('magic', `A prioridade de Magia ou Ressonância não permite este tipo de personagem.`);
    } else {
      const skillGrant = d.option.skills;
      if (skillGrant && c.awakening.freeSkills.length !== skillGrant.count) {
        error('magic', `Escolha ${skillGrant.count} perícia(s) gratuita(s) em nível ${skillGrant.rating}.`);
      }
      if (d.option.skillGroup && !c.awakening.freeSkillGroup) error('magic', 'Escolha o grupo de perícias do mago de aspecto.');
      for (const id of c.awakening.freeSkills) {
        const skill = byId(skills, id);
        if (skillGrant?.kind === 'magic' && skill?.restricted !== 'magic') error('magic', `${skill?.name ?? id} não é uma perícia Mágica.`);
        if (skillGrant?.kind === 'resonance' && skill?.restricted !== 'resonance') error('magic', `${skill?.name ?? id} não é uma perícia de Ressonância.`);
      }
    }
    if (isCaster(c) && !c.awakening.tradition) error('magic', 'Escolha uma tradição mágica.');
  }
  if (!isAwakened(c) && c.special.magic.points + c.special.magic.karmaRanks > 0) error('magic', 'Só personagens Despertos podem ter Magia.');
  if (!isTechnomancer(c) && c.special.resonance.points + c.special.resonance.karmaRanks > 0) error('magic', 'Só tecnomantes podem ter Ressonância.');
  if (d.magicNatural > specialMax(c, 'magic')) error('magic', 'Magia acima do limite máximo.');
  if (d.resonanceNatural > specialMax(c, 'resonance')) error('magic', 'Ressonância acima do limite máximo.');

  if (isCaster(c)) {
    const cap = d.magicNatural * 2;
    if (c.spells.length > cap) error('magic', `Máximo de ${cap} feitiços (Magia x 2).`);
    for (const kind of ['ritual', 'preparation'] as const) {
      const count = c.formulae.filter((f) => f.kind === kind).length;
      if (count > cap) error('magic', `Máximo de ${cap} ${kind === 'ritual' ? 'rituais' : 'preparativos'} (Magia x 2).`);
    }
    if (c.spells.length < d.freeSpells) warn('magic', `Ainda há ${d.freeSpells - c.spells.length} feitiço(s) gratuito(s).`);
  } else if (c.spells.length || c.formulae.length) {
    error('magic', 'Este personagem não conjura feitiços.');
  }
  if (isTechnomancer(c)) {
    if (c.complexForms.length > d.natural.logic) error('magic', `Máximo de ${d.natural.logic} formas complexas (Lógica).`);
    if (c.complexForms.length < d.freeComplexForms) warn('magic', `Ainda há ${d.freeComplexForms - c.complexForms.length} forma(s) complexa(s) gratuita(s).`);
  } else if (c.complexForms.length) {
    error('magic', 'Só tecnomantes têm formas complexas.');
  }
  if (isAdept(c)) {
    if (d.points.powerPoints.spent > d.points.powerPoints.pool) error('magic', 'Pontos de Poder gastos além do disponível.');
    if (type === 'mysticAdept' && c.awakening.powerPointsBought > d.magicNatural) error('magic', 'Pontos de Poder comprados não podem superar a Magia.');
  } else if (c.adeptPowers.length) {
    error('magic', 'Só adeptos têm poderes de adepto.');
  }

  // Etapa 4: qualidades
  const limit = d.level.qualityLimit;
  if (d.karma.positive > limit) error('qualities', `Qualidades positivas limitadas a ${limit} de Carma.`);
  if (d.karma.negative > limit) error('qualities', `Qualidades negativas limitadas a ${limit} de Carma.`);
  for (const entry of c.qualities) {
    const quality = byId(qualities, entry.id);
    if (!quality) {
      error('qualities', `Qualidade desconhecida: ${entry.id}.`);
      continue;
    }
    const requires = quality.requires;
    if (requires?.metatypes && c.metatype && !requires.metatypes.includes(c.metatype)) error('qualities', `${quality.name} não está disponível para ${d.metatype?.name}.`);
    if ((requires?.awakened || requires?.magic) && !isAwakened(c)) error('qualities', `${quality.name} exige atributo Magia.`);
    if (requires?.casterOrTechnomancer && !isCaster(c) && !isTechnomancer(c)) error('qualities', `${quality.name} exige um conjurador ou tecnomante.`);
    for (const other of quality.incompatible ?? []) {
      if (hasQuality(c, other)) error('qualities', `${quality.name} é incompatível com ${byId(qualities, other)?.name}.`);
    }
    if (quality.gmApproval) warn('qualities', `${quality.name} depende da aprovação do mestre.`);
    if (quality.choice === 'attribute' && !entry.attribute) error('qualities', `Escolha o atributo de ${quality.name}.`);
    if (entry.id === 'atributo-excepcional' && entry.attribute === 'edge') error('qualities', 'Atributo Excepcional não afeta Trunfo.');
    if (quality.choice === 'limits' && entry.limits.physical + entry.limits.mental + entry.limits.social !== entry.rating) {
      error('qualities', `Distribua ${entry.rating} nível(is) de ${quality.name} entre os limites.`);
    }
    if (quality.choice === 'mentor' && !c.awakening.mentorSpirit) error('qualities', 'Escolha o espírito mentor.');
    if (quality.needsNote && !entry.note.trim()) warn('qualities', `${quality.name}: informe ${quality.needsNote.toLowerCase()}.`);
    if (!qualityValue(entry)) warn('qualities', `${quality.name} está sem custo definido.`);
  }

  // Etapa 5: perícias
  const skillLeft = d.points.skills.pool - d.points.skills.spent;
  if (skillLeft > 0) error('skills', `Faltam gastar ${skillLeft} pontos de perícia.`);
  if (skillLeft < 0) error('skills', `${-skillLeft} pontos de perícia gastos a mais.`);
  const groupLeft = d.points.groups.pool - d.points.groups.spent;
  if (groupLeft > 0) error('skills', `Faltam gastar ${groupLeft} pontos de grupo de perícias.`);
  if (groupLeft < 0) error('skills', `${-groupLeft} pontos de grupo gastos a mais.`);

  const aptitudeLimit = (id: string) => {
    const aptitude = c.qualities.find((q) => q.id === 'aptidao');
    const skill = byId(skills, id);
    return aptitude && skill && aptitude.note.trim().toLowerCase() === skill.name.toLowerCase() ? CREATION_SKILL_MAX + 1 : CREATION_SKILL_MAX;
  };
  const aspected = c.awakening.freeSkillGroup;
  const allowedMagicSkills = type === 'aspected' ? (byId(skillGroups, aspected)?.skills ?? []) : null;

  for (const skill of skills) {
    const rating = skillRating(c, skill.id);
    if (!rating) continue;
    if (rating > aptitudeLimit(skill.id)) error('skills', `${skill.name} acima do nível máximo na criação.`);
    if (skill.restricted === 'magic') {
      if (!isCaster(c)) error('skills', `${skill.name} exige um conjurador.`);
      if (allowedMagicSkills && !allowedMagicSkills.includes(skill.id)) error('skills', `${skill.name} está fora do grupo do mago de aspecto.`);
    }
    if (skill.restricted === 'resonance' && !isTechnomancer(c)) error('skills', `${skill.name} exige Ressonância.`);
    if (skill.restricted === 'astral') {
      const percepts = isCaster(c) || c.adeptPowers.some((p) => p.id === 'percepcao-astral');
      if (!percepts) error('skills', 'Sentido Astral exige percepção astral.');
    }
    const group = skillGroups.find((g) => g.skills.includes(skill.id) && skillGroupRating(c, g.id) > 0);
    if (group) error('skills', `${skill.name} já faz parte do grupo ${group.name}.`);
  }
  for (const group of skillGroups) {
    const rating = skillGroupRating(c, group.id);
    if (!rating) continue;
    if (rating > CREATION_SKILL_MAX) error('skills', `Grupo ${group.name} acima do nível máximo.`);
    if (group.restricted === 'magic' && (!isCaster(c) || type === 'adept')) error('skills', `Grupo ${group.name} exige um conjurador.`);
    if (type === 'aspected' && group.restricted === 'magic' && group.id !== aspected) error('skills', `Grupo ${group.name} está fora do escolhido pelo mago de aspecto.`);
    if (group.restricted === 'resonance' && !isTechnomancer(c)) error('skills', `Grupo ${group.name} exige Ressonância.`);
  }
  for (const entry of [...c.knowledge, ...c.languages.filter((l) => !l.native)]) {
    if (!entry.name.trim()) warn('skills', 'Há uma perícia de Conhecimento ou Idioma sem nome.');
    if (entry.points + entry.karmaRanks > CREATION_SKILL_MAX) error('skills', `${entry.name || 'Perícia'} acima do nível 6.`);
    if (entry.points + entry.karmaRanks < 1) error('skills', `${entry.name || 'Perícia'} precisa de ao menos nível 1.`);
  }
  const natives = c.languages.filter((l) => l.native).length;
  const nativeLimit = hasQuality(c, 'bilingue') ? 2 : 1;
  if (natives < 1) error('skills', 'Escolha o idioma nativo.');
  if (natives > nativeLimit) error('skills', `Máximo de ${nativeLimit} idioma(s) nativo(s).`);

  // Etapa 6: recursos
  if (d.nuyen.remaining < 0) error('resources', `${-d.nuyen.remaining}¥ gastos além do disponível.`);
  if (d.nuyen.remaining > MAX_CARRIED_NUYEN) warn('resources', `Só ${MAX_CARRIED_NUYEN}¥ passam para o jogo. O excedente será perdido.`);
  if (c.karmaToNuyen > d.level.maxKarmaToNuyen) error('resources', `Máximo de ${d.level.maxKarmaToNuyen} Carma em neoienes.`);
  if (d.essence <= 0) error('resources', 'A Essência precisa ficar acima de 0.');
  for (const item of c.gear) {
    const totals = gearTotals(item);
    if (totals.availability > d.level.maxAvailability) error('resources', `${item.name || 'Item'}: Disponibilidade acima de ${d.level.maxAvailability}.`);
    if (item.deviceRating > d.level.maxDeviceRating) error('resources', `${item.name || 'Item'}: Nível de Dispositivo acima de ${d.level.maxDeviceRating}.`);
    if (!item.name.trim()) warn('resources', 'Há um item sem nome.');
  }
  if (type !== 'none' && d.essencePenalty > 0) warn('resources', `A perda de Essência reduziu Magia/Ressonância em ${d.essencePenalty}.`);

  // Etapa 7: Carma
  if (d.karma.remaining < 0) error('karma', `${-d.karma.remaining} de Carma gastos além do disponível.`);
  if (d.karma.remaining > MAX_CARRIED_KARMA) error('karma', `Só ${MAX_CARRIED_KARMA} de Carma passam para o jogo. Gaste ${d.karma.remaining - MAX_CARRIED_KARMA}.`);
  for (const contact of c.contacts) {
    if (contact.connection + contact.loyalty > 7) error('karma', `${contact.name || 'Contato'}: máximo de 7 Carma por contato.`);
    if (!contact.name.trim()) warn('karma', 'Há um contato sem nome.');
  }
  if (c.spirits.length && !isCaster(c)) error('karma', 'Só conjuradores vinculam espíritos.');
  if (c.spirits.length > d.natural.charisma) error('karma', `Máximo de ${d.natural.charisma} espíritos vinculados (Carisma).`);
  if (c.sprites.length && !isTechnomancer(c)) error('karma', 'Só tecnomantes registram sprites.');
  if (c.sprites.length > d.natural.charisma) error('karma', `Máximo de ${d.natural.charisma} sprites registrados (Carisma).`);
  if (c.foci.length && !isAwakened(c)) error('karma', 'Só Despertos vinculam focos.');
  const focusForce = c.foci.reduce((sum, f) => sum + f.force, 0);
  if (focusForce > d.magicNatural * 2 && isAwakened(c)) error('karma', `Poder total de focos limitado a ${d.magicNatural * 2} (Magia x 2).`);
  const knownFocus = (id: string) => magicData.focusTypes.some((f) => f.id === id);
  if (c.foci.some((f) => !knownFocus(f.type))) error('karma', 'Há um foco de tipo desconhecido.');

  // Etapa 9
  if (!c.personal.alias.trim()) warn('touches', 'Dê um nome ou pseudônimo ao personagem.');
  if (!c.personal.background.trim()) warn('touches', 'Escreva o histórico do personagem.');

  return issues;
}
