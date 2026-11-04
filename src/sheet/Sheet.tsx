import type { ReactNode } from 'react';
import { Term } from '../ui/Term';
import { motion } from 'motion/react';
import {
  ATTRIBUTE_NAMES,
  AWAKENING_NAMES,
  CORE_ATTRIBUTES,
  adeptPowers,
  byId,
  complexForms,
  knowledgeCategories,
  magicData,
  programs,
  qualities,
  skillGroups,
  spells,
} from '../data';
import { childrenOf, weaponDamage } from '../engine/catalog';
import { adeptPowerCost, effectiveSkills, gearTotals, isAwakened, isTechnomancer, qualityValue } from '../engine/derive';
import type { GearItem } from '../schema/character';
import { watcherCorp } from '../engine/megacorp';
import { useCharacter } from '../store';
import { CorpBanner } from '../ui/CorpBanner';
import { formatNuyen } from '../ui/primitives';
import { augmentedText, initiativeText } from './format';

function Section({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
      className={`sheet-section cut border border-line bg-panel/90 p-3 ${className}`}
    >
      <h3 className="mb-2 font-display text-xs font-bold tracking-widest text-accent uppercase">{title}</h3>
      {children}
    </motion.section>
  );
}

function Row({ label, term, value }: { label: ReactNode; term?: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-line/50 py-0.5">
      <span className="text-mute">{term ? <Term id={term}>{label}</Term> : label}</span>
      <span className="text-right font-mono">{value}</span>
    </div>
  );
}

function Track({ boxes, label, term }: { boxes: number; label: string; term: string }) {
  return (
    <div>
      <div className="label mb-1"><Term id={term}>{label}</Term> ({boxes})</div>
      <div className="grid grid-cols-6 gap-0.5" role="img" aria-label={`${boxes} caixas de ${label}`}>
        {Array.from({ length: boxes }, (_, index) => (
          <div key={index} className="relative h-6 border border-line">
            {(index + 1) % 3 === 0 && <span className="absolute right-0.5 bottom-0 font-mono text-[0.6rem] text-mute">–{(index + 1) / 3}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

const None = () => <p className="text-mute">—</p>;

function WeaponTable({ items, melee = false, strength = 0 }: { items: GearItem[]; melee?: boolean; strength?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="label">
          <tr>
            <th className="py-1 font-normal">Arma</th>
            <th className="font-normal"><Term id="gear:accuracy">Pre</Term></th>
            <th className="font-normal"><Term id="gear:damage">Dano</Term></th>
            <th className="font-normal"><Term id="gear:ap">PA</Term></th>
            {melee ? <th className="font-normal"><Term id="gear:reach">Alcance</Term></th> : <th className="font-normal"><Term id="gear:mode">Modo</Term></th>}
            {!melee && <th className="font-normal"><Term id="gear:rc">CR</Term></th>}
            {!melee && <th className="font-normal"><Term id="gear:ammoType">Munição</Term></th>}
          </tr>
        </thead>
        <tbody className="font-mono">
          {items.map((item) => (
            <tr key={item.id} className="border-t border-line/50">
              <td className="py-1 pr-2 font-body">{item.name}</td>
              <td>{item.weapon?.acc}</td>
              <td>{weaponDamage(item.weapon?.dv ?? '', strength)}</td>
              <td>{item.weapon?.ap}</td>
              {melee ? <td>{item.weapon?.reach ?? 0}</td> : <td>{item.weapon?.mode}</td>}
              {!melee && <td>{item.weapon?.rc}</td>}
              {!melee && <td>{item.weapon?.ammo}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Sheet() {
  const { character: c, derived: d } = useCharacter();
  const { personal } = c;
  const allSkills = effectiveSkills(c);
  const childrenText = (item: GearItem) => childrenOf(c, item.id).map((child) => child.name).join(', ');
  const itemLabel = (item: GearItem) => {
    const extras = childrenText(item);
    return `${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name || 'Item'}${item.rating ? ` ${item.rating}` : ''}${item.grade === 'alpha' ? ' (alphaware)' : ''}${extras ? ` [${extras}]` : ''}`;
  };
  const roots = c.gear.filter((item) => !item.parentId);
  const ranged = roots.filter((item) => item.weapon && item.weapon.type !== 'melee');
  const melee = roots.filter((item) => item.weapon?.type === 'melee');
  const armorItems = roots.filter((item) => (item.armor > 0 || item.armorBonus > 0) && !item.augType);
  const augmentations = roots.filter((item) => item.augType || item.essence > 0);
  const otherGear = roots.filter((item) => !ranged.includes(item) && !melee.includes(item) && !armorItems.includes(item) && !augmentations.includes(item));
  const groups = skillGroups.filter((group) => allSkills.some((row) => row.group === group.name));
  const limit = (key: keyof typeof d.limits) => (d.limitBonus[key] ? `${d.limits[key]} (${d.limits[key] + d.limitBonus[key]})` : d.limits[key]);
  const fields: [string, string][] = [
    ['Meta-tipo', d.metatype?.name ?? '—'],
    ['Etnia', personal.ethnicity],
    ['Idade', personal.age],
    ['Sexo', personal.sex],
    ['Altura', personal.height],
    ['Peso', personal.weight],
    ['Nome verdadeiro', personal.realName],
    ['Jogador', personal.player],
  ];

  return (
    <motion.article initial="hidden" animate="shown" transition={{ staggerChildren: 0.05 }} className="sheet grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="no-print md:col-span-2 xl:col-span-3">
        <CorpBanner corp={watcherCorp(c)} label="Arquivo sob vigilância" />
      </div>
      <Section title="Informações pessoais" className="md:col-span-2 xl:col-span-3">
        <h2 className="glitch font-spray text-4xl text-accent uppercase" data-text={personal.alias || 'Runner sem nome'}>{personal.alias || 'Runner sem nome'}</h2>
        <p className="mb-2 text-mute">{personal.concept}</p>
        <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map(([label, value]) => (
            <Row key={label} label={label} value={value || '—'} />
          ))}
          <Row label="Crédito das Ruas" term="concept:streetCred" value={personal.streetCred} />
          <Row label="Notoriedade" term="concept:notoriety" value={personal.notoriety} />
          <Row label="Consciência Pública" term="concept:publicAwareness" value={personal.publicAwareness} />
          <Row label="Carma" term="stat:karma" value={Math.max(0, d.karma.remaining)} />
        </div>
      </Section>

      <Section title="Atributos">
        {CORE_ATTRIBUTES.map((key) => (
          <Row key={key} label={ATTRIBUTE_NAMES[key]} term={`attr:${key}`} value={augmentedText(d.natural[key], d.augmented[key])} />
        ))}
        <Row label="Trunfo" term="attr:edge" value={d.edge} />
        <Row label="Essência" term="attr:essence" value={d.essence.toFixed(2)} />
        {isAwakened(c) && <Row label="Magia" term="attr:magic" value={d.magic} />}
        {isTechnomancer(c) && <Row label="Ressonância" term="attr:resonance" value={d.resonance} />}
      </Section>

      <Section title="Combate">
        <Row label="Iniciativa" term="stat:initiative" value={initiativeText(d.initiative.natural, d.initiative.value, d.initiative.dice)} />
        <Row label="Iniciativa na Matriz" term="stat:matrix" value={`${d.matrixAR.value} + ${d.matrixAR.dice}D6`} />
        <Row label="Iniciativa Astral" term="stat:astral" value={`${d.astralInitiative.value} + ${d.astralInitiative.dice}D6`} />
        <Row label="Compostura" term="stat:composure" value={d.composure} />
        <Row label="Julgar Intenções" term="stat:judge" value={d.judgeIntentions} />
        <Row label="Memória" term="stat:memory" value={d.memory} />
        <Row label="Erguer/Carregar" term="stat:lift" value={d.liftCarry} />
        <Row label="Movimento" term="stat:movement" value={`${d.movement.walk}/${d.movement.run}/+${d.movement.sprintPerHit}`} />
        <Row label="Limite Físico" term="stat:limit-physical" value={limit('physical')} />
        <Row label="Limite Mental" term="stat:limit-mental" value={limit('mental')} />
        <Row label="Limite Social" term="stat:limit-social" value={limit('social')} />
        <Row label="Armadura" term="stat:armor" value={d.armor} />
      </Section>

      <Section title="Monitor de condição">
        <div className="space-y-3">
          <Track boxes={d.monitors.physical} label="Físico" term="stat:monitor-physical" />
          <Track boxes={d.monitors.stun} label="Atordoamento" term="stat:monitor-stun" />
          <Row label="Caixas em Excesso" term="stat:overflow" value={d.monitors.overflow} />
        </div>
      </Section>

      <Section title="Perícias Ativas" className="md:col-span-2 xl:col-span-2">
        {!allSkills.length && <None />}
        <div className="grid gap-x-6 sm:grid-cols-2">
          {allSkills.map((row) => (
            <Row key={row.id} label={`${row.name}${row.specialization ? ` (${row.specialization})` : ''}`} term={`skill:${row.id}`} value={row.rating} />
          ))}
        </div>
        {groups.length > 0 && <p className="mt-2 text-sm text-mute">Grupos: {groups.map((g) => g.name).join(', ')}</p>}
      </Section>

      <Section title="Conhecimento e Idiomas">
        {c.languages.map((language) => (
          <Row key={language.id} label={language.name || 'Idioma'} value={language.native ? 'N' : language.points + language.karmaRanks} />
        ))}
        {c.knowledge.map((entry) => (
          <Row key={entry.id} label={`${entry.name || 'Conhecimento'} (${byId(knowledgeCategories, entry.category)?.name})`} value={entry.points + entry.karmaRanks} />
        ))}
        {!c.languages.length && !c.knowledge.length && <None />}
      </Section>

      <Section title="Qualidades">
        {!c.qualities.length && <None />}
        {c.qualities.map((entry, index) => {
          const quality = byId(qualities, entry.id);
          const detail = [entry.option, entry.note, entry.attribute && ATTRIBUTE_NAMES[entry.attribute]].filter(Boolean).join(', ');
          return (
            <Row
              key={`${entry.id}-${index}`}
              label={`${quality?.name ?? entry.id}${quality?.maxRating ? ` ${entry.rating}` : ''}${detail ? ` (${detail})` : ''}`}
              value={`${quality?.kind === 'positive' ? '–' : '+'}${qualityValue(entry)}`}
            />
          );
        })}
      </Section>

      {(isAwakened(c) || isTechnomancer(c)) && (
        <Section title={AWAKENING_NAMES[c.awakening.type]}>
          {c.awakening.tradition && <Row label="Tradição" term="magic:tradition" value={byId(magicData.traditions, c.awakening.tradition)?.name} />}
          {c.awakening.tradition && <Row label="Resistir ao Dreno" term="stat:drain" value={d.drainResist} />}
          {isTechnomancer(c) && <Row label="Resistir ao Enfraquecimento" term="stat:fade" value={d.fadeResist} />}
          {c.qualities.some((q) => q.id === 'espirito-mentor') && <Row label="Espírito Mentor" term="magic:mentor" value={byId(magicData.mentorSpirits, c.awakening.mentorSpirit)?.name ?? '—'} />}
          {isTechnomancer(c) && (
            <>
              <Row label="Ataque" term="persona:attack" value={d.persona.attack} />
              <Row label="Corrupção" term="persona:sleaze" value={d.persona.sleaze} />
              <Row label="Processamento de Dados" term="persona:data" value={d.persona.dataProcessing} />
              <Row label="Firewall" term="persona:firewall" value={d.persona.firewall} />
              <Row label="Nível de Dispositivo" term="persona:device" value={d.persona.deviceRating} />
            </>
          )}
        </Section>
      )}

      {c.spells.length + c.formulae.length > 0 && (
        <Section title="Feitiços, rituais e preparativos" className="md:col-span-2">
          <div className="grid gap-x-6 sm:grid-cols-2">
            {c.spells.map((id) => {
              const spell = byId(spells, id);
              return <Row key={id} label={spell?.name ?? id} value={`${spell?.type} ${spell?.range} ${spell?.duration} ${spell?.drain}`} />;
            })}
            {c.formulae.map((formula) => (
              <Row key={formula.id} label={formula.name || 'Fórmula'} value={formula.kind === 'ritual' ? 'Ritual' : 'Preparativo'} />
            ))}
          </div>
        </Section>
      )}

      {c.complexForms.length > 0 && (
        <Section title="Formas complexas">
          {c.complexForms.map((id) => {
            const form = byId(complexForms, id);
            return <Row key={id} label={form?.name ?? id} value={`${form?.duration} VE ${form?.fade}`} />;
          })}
        </Section>
      )}

      {c.adeptPowers.length > 0 && (
        <Section title="Poderes de adepto">
          {c.adeptPowers.map((power) => {
            const data = byId(adeptPowers, power.id);
            const rated = data?.perRating || data?.costByRating;
            return <Row key={power.id} label={`${data?.name ?? power.id}${rated ? ` ${power.rating}` : ''}${power.choice ? ` (${ATTRIBUTE_NAMES[power.choice] ?? power.choice})` : ''}`} value={`${adeptPowerCost(power.id, power.rating)} PP`} />;
          })}
        </Section>
      )}

      {c.spirits.length + c.sprites.length + c.foci.length > 0 && (
        <Section title="Aliados e focos">
          {c.spirits.map((spirit) => <Row key={spirit.id} label={`Espírito de ${spirit.type} (Poder ${d.magic})`} value={`${spirit.services} serviços`} />)}
          {c.sprites.map((sprite) => <Row key={sprite.id} label={`Sprite de ${sprite.type} (Nível ${d.resonance})`} value={`${sprite.tasks} tarefas`} />)}
          {c.foci.map((focus) => <Row key={focus.id} label={focus.name || byId(magicData.focusTypes, focus.type)?.name} value={`Poder ${focus.force}`} />)}
        </Section>
      )}

      {c.programs.length > 0 && (
        <Section title="Programas">
          <p>{c.programs.map((id) => byId(programs, id)?.name).join(', ')}</p>
        </Section>
      )}

      {ranged.length > 0 && (
        <Section title="Armas à distância" className="md:col-span-2 xl:col-span-3">
          <WeaponTable items={ranged} />
        </Section>
      )}

      {melee.length > 0 && (
        <Section title="Armas corpo a corpo" className="md:col-span-2">
          <WeaponTable items={melee} melee strength={d.augmented.strength} />
        </Section>
      )}

      {armorItems.length > 0 && (
        <Section title="Armadura">
          {armorItems.map((item) => <Row key={item.id} label={itemLabel(item)} term="stat:armor" value={item.armor || `+${item.armorBonus}`} />)}
        </Section>
      )}

      {augmentations.length > 0 && (
        <Section title="Ampliações" className="md:col-span-2">
          <div className="grid gap-x-6 sm:grid-cols-2">
            {augmentations.map((item) => <Row key={item.id} label={itemLabel(item)} value={`Ess ${gearTotals(item).essence.toFixed(2)}`} />)}
          </div>
        </Section>
      )}

      {otherGear.length > 0 && (
        <Section title="Equipamentos" className="md:col-span-2">
          <div className="grid gap-x-6 sm:grid-cols-2">
            {otherGear.map((item) => <Row key={item.id} label={itemLabel(item)} value={item.category} />)}
          </div>
        </Section>
      )}

      <Section title="IDs, estilo de vida e dinheiro">
        <Row label="Estilo de vida" term="gear:lifestyle" value={`${d.nuyen.lifestyle.name} (${c.lifestyle.months} ${c.lifestyle.months > 1 ? 'meses' : 'mês'})`} />
        <Row label="Neoienes" term="stat:nuyen" value={formatNuyen(d.nuyen.starting)} />
      </Section>

      <Section title="Contatos">
        {!c.contacts.length && <None />}
        {c.contacts.map((contact) => (
          <Row key={contact.id} label={`${contact.name || 'Contato'}${contact.role ? ` (${contact.role})` : ''}`} value={`C${contact.connection} / L${contact.loyalty}`} />
        ))}
      </Section>

      {d.metatype && d.metatype.racial.length > 0 && (
        <Section title="Bônus raciais">
          <p>{d.metatype.racial.join(' · ')}</p>
        </Section>
      )}

      {(personal.background || personal.notes) && (
        <Section title="Histórico" className="md:col-span-2 xl:col-span-3">
          <p className="whitespace-pre-wrap">{personal.background}</p>
          {personal.notes && <p className="mt-2 whitespace-pre-wrap text-mute">{personal.notes}</p>}
        </Section>
      )}
    </motion.article>
  );
}

