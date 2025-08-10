import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import '../styles/priority.css';
import { objectInfos } from '../stores/objectInfos';
import { useCharacterStore } from "../stores/useCharacterStore";


type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function PriorityStep({ onNext , onBack}: Props){

    const metatype = useCharacterStore((state) => state.character.bio.metatype);
    const setPriority = useCharacterStore(state => state.setPriority);

    const [choices, setChoices] = useState({
        metatype: {
            label: "Metatype",
            value: ""
        },
        attributes: {
            label: "Attributes",
            value: ""
        },
        magicOrRessonance: {
            label: "Magic Or Ressonance",
            value: ""
        },
        skills: {
            label: "Skills",
            value: ""
        },
        resources: {
            label: "Resources",
            value: ""
        },
    });

    const allPrioritiesSelected = Object.values(choices).every(choice => choice.value !== "");

    // Lista fixa de valores possíveis
    const priorityOptions = ["A", "B", "C", "D", "E"];

    const getAvailableOptions = (currentCategory: keyof typeof choices) => {
        const used = Object.entries(choices)
        .filter(([key]) => key !== currentCategory)
        .map(([_, obj]) => obj.value)
        .filter(v => v !== ""); // remove valores vazios

        return priorityOptions.filter(p => !used.includes(p));
    };

    return(
        <div>
            <p>{objectInfos.labels.priority}</p>
            <h3>{objectInfos.labels.metatypeSelected} {metatype.name}</h3>
            <table>
                <caption><h2 className='alternative-text'>{objectInfos.labels.priorityTable}</h2></caption>
                <thead>
                    <tr>
                        <th>
                            {objectInfos.labels.priority}
                        </th>
                        <th>
                            {objectInfos.labels.metatype}
                        </th>
                        <th>
                            {objectInfos.labels.attributes}
                        </th>
                        <th className='magic-col'>
                            {objectInfos.labels.magicOrRessonance}
                        </th>
                        <th>
                            {objectInfos.labels.skills}
                        </th>
                        <th>
                            {objectInfos.labels.resources}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(objectInfos.priorityTable).map(([priorityKey, data]) => (
                        <tr key={priorityKey}>
                            <td>{data.priority}</td>
                            <td>
                                {Object.entries(data.metatype)
                                    .map(([meta, val], idx) => (<div key={idx}> {meta} : {val}</div>))}
                            </td>
                            <td>{data.attributes}</td>
                            <td className='magic-col'>
                                {Object.entries(data.magicOrRessonance)
                                    .map(([_, info], idx) => (
                                        <div key={idx}>
                                            <strong className='alternative-text'>{info.title}</strong>: {info.description}
                                        </div>
                                    ))}
                            </td>
                            <td>{data.skills}</td>
                            <td>{data.resources}</td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
            <div className='blue-neon-border'>
                <p>Now chose the priority you want for each one of those aspects of your character</p>
                <div>
                    <table>
                        <thead>
                            <tr>
                            <th><h3 className='alternative-text'>{objectInfos.labels.category}</h3></th>
                            <th><h3 className='alternative-text'>{objectInfos.labels.priority}</h3></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Object.keys(choices) as Array<keyof typeof choices>).map((category) => (
                            <tr key={category}>
                                <td>{choices[category].label}</td>
                                <td>
                                <select
                                    className='blue-neon-border'
                                    value={choices[category].value}
                                    onChange={(e) =>{
                                        const newValue = e.target.value;
                                        setChoices({ ...choices, [category]: {
                                            ...choices[category],
                                            value: newValue
                                        }});
                                        setPriority(category, newValue);
                                    }}
                                >
                                    <option value="">{objectInfos.labels.selectOption}</option>
                                    {getAvailableOptions(category).map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                    ))}
                                </select>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext} disabled={!allPrioritiesSelected}>Próximo</button>
            </div>
        </div>
    );
}