import "../styles/global.css";
import { objectInfos } from "../stores/objectInfos";
import type {MetatypeCardProps} from '../stores/metatypes';
import { useCharacterStore } from "../stores/useCharacterStore";

type AttributeStepCounterProps = {
  name: string;
  attributes: Record<string, number>;
};

export default function AttributeStepCounter({ name, attributes }: AttributeStepCounterProps){

    const currentAttributes = useCharacterStore((state) => state.character.attributes);
    const metatype = useCharacterStore((state) => state.character.bio.metatype);
    const setAttribute = useCharacterStore((state) => state.setAttribute);

    type AttributeKey = "strength" | "agility" | "logic" | "charisma" | "reaction" | "intuition" | "willpower" | "body" | "edge";

    return(
        <div>
            <div>
                <table>
                    <caption><h2 className='alternative-text'>{objectInfos.labels.attributes}</h2></caption>
                    <thead>
                        <tr>
                            <th>Atributo</th>
                            <th>Valor Atual</th>
                            <th>Decrease / Increase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(attributes).map(([key]) => (
                            <tr key={key}>
                                {/* Label do atributo */}
                                <td>
                                    <p>{objectInfos.attributes[key as keyof typeof objectInfos.attributes] ?? key}</p>
                                </td>

                                {/* Valor atual salvo no store */}
                                <td>
                                    {currentAttributes[key as keyof typeof currentAttributes]}
                                </td>

                                {/* Botões de controle */}
                                <td>
                                    <button
                                        className="button-generic"
                                        onClick={() => {
                                            const attrKey = key as AttributeKey;
                                            const currentValue = currentAttributes[attrKey];
                                            const minValue = metatype.attributes[attrKey].min;
                                            const newValue = currentValue - 1;

                                            if (newValue >= minValue) {
                                            setAttribute(attrKey, newValue);
                                            }
                                        }}
                                    >
                                        -
                                    </button>
                                    <button
                                        className="button-generic"
                                        onClick={() => {
                                            const attrKey = key as AttributeKey;
                                            const currentValue = currentAttributes[attrKey];
                                            const maxValue = metatype.attributes[attrKey].max;
                                            const newValue = currentValue + 1;

                                            if (newValue <= maxValue) {
                                            setAttribute(attrKey, newValue);
                                            }
                                        }}
                                    >
                                        +
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}