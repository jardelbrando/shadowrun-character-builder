import "../styles/global.css";
import { objectInfos } from "../stores/objectInfos";
import type {MetatypeCardProps} from '../stores/metatypes';
import { useCharacterStore } from "../stores/useCharacterStore";

type AttributeStepCounterProps = {
  name: string;
  attributes: Record<string, number>;
};

const adjustableAttributes = [
  "strength",
  "agility",
  "logic",
  "charisma",
  "reaction",
  "intuition",
  "willpower",
  "body",
  "edge",
] as const;

type AttributeKey = typeof adjustableAttributes[number];

export default function AttributeStepCounter({ name, attributes }: AttributeStepCounterProps){

    const storeAttributes = useCharacterStore((s) => s.character.attributes);
    const metatype = useCharacterStore((s) => s.character.bio.metatype) as MetatypeCardProps | undefined;
    const setAttribute = useCharacterStore((s) => s.setAttribute);

    const characterPriority = useCharacterStore((s) => (s.character.priorities.attributes ?? "A"));

    const priorityBudget: Record<string, number> = {
        A: 24,
        B: 20,
        C: 16,
        D: 14,
        E: 12,
    };
 
    const priorityPoints = priorityBudget[characterPriority] ?? 20;

    if (!metatype || !metatype.attributes) {
        return <p>Selecione um metatipo para ajustar os atributos.</p>;
    }

     const currentAttributes = storeAttributes as Record<AttributeKey, number>;

    const usedPoints = adjustableAttributes.reduce((sum, k) => {
        const curr = currentAttributes[k] ?? 0;
        const min = metatype.attributes[k].min ?? 0; // safe fallback
        return sum + Math.max(0, curr - min);
    }, 0);
    const remainingPoints = Math.max(0, priorityPoints - usedPoints);

    const numberAtMetatypeMax = adjustableAttributes.reduce((acc, k) => {
        const curr = currentAttributes[k] ?? 0;
        const max = metatype.attributes[k].max ?? Infinity;
        return acc + (curr === max ? 1 : 0);
    }, 0);

    const canIncrease = (attrKey: AttributeKey) => {
        const curr = currentAttributes[attrKey] ?? 0;
        const max = metatype.attributes[attrKey].max;

        // não ultrapassar max do metatype
        if (curr >= max) return false;

        // se este aumento faria esse atributo atingir o max e já há outro atributo no max, bloquear
        const willReachMax = curr + 1 === max;
        const anotherMaxed = adjustableAttributes.some(k => k !== attrKey && (currentAttributes[k] ?? 0) === metatype.attributes[k].max);
        if (willReachMax && anotherMaxed) return false;

        // não gastar mais pontos do que o orçamento
        if (remainingPoints <= 0) return false;

        // se passou em todas as checagens, permite
        return true;
    };

    const canDecrease = (attrKey: AttributeKey) => {
        const curr = currentAttributes[attrKey] ?? 0;
        const min = metatype.attributes[attrKey].min;
        return curr > min;
    };

    const increase = (attrKey: AttributeKey) => {
        if (!canIncrease(attrKey)) return;
        const next = (currentAttributes[attrKey] ?? 0) + 1;
        setAttribute(attrKey, next);
    };

    const decrease = (attrKey: AttributeKey) => {
        if (!canDecrease(attrKey)) return;
        const next = (currentAttributes[attrKey] ?? 0) - 1;
        setAttribute(attrKey, next);
    };

    const keysToRender = adjustableAttributes.filter(k => k in currentAttributes);

    return(
        <div>
            <div>
                <h3>{name}</h3>
                <div>
                    <strong>{objectInfos.labels.priorityPoints}:</strong> {priorityPoints} &nbsp;|&nbsp;
                    <strong>{objectInfos.labels.usedPoints}:</strong> {usedPoints} &nbsp;|&nbsp;
                    <strong>{objectInfos.labels.remaing}:</strong> {remainingPoints}
                   
                </div>
                 <strong>{objectInfos.labels.attMaxNote}</strong>
                    
                
                <table>
                    <caption><h2 className='alternative-text'>{objectInfos.labels.attributes}</h2></caption>
                    <thead>
                        <tr>
                            <th>{objectInfos.labels.attributes}</th>
                            <th>{objectInfos.labels.currentValue}</th>
                            <th>{objectInfos.labels.startFinalValues}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keysToRender.map((key) => {
                            const k = key as AttributeKey;
                            const curr = currentAttributes[k] ?? 0;
                            const min = metatype.attributes[k].min;
                            const max = metatype.attributes[k].max;
                            return (
                            <tr key={k}>
                                <td>{objectInfos.attributes[k as keyof typeof objectInfos.attributes] ?? k}</td>
                                <td>{curr}</td>
                                <td>{min} / {max}</td>
                                <td>
                                <button
                                    className="button-generic"
                                    onClick={() => decrease(k)}
                                    disabled={!canDecrease(k)}
                                >
                                    -
                                </button>

                                <button
                                    className="button-generic"
                                    onClick={() => increase(k)}
                                    disabled={!canIncrease(k)}
                                    style={{ marginLeft: 8 }}
                                >
                                    +
                                </button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}