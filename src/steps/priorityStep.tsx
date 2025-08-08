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

    return(
        <div>
            <p>{objectInfos.labels.priority}</p>
            <h3>{objectInfos.labels.metatypeSelected} {metatype.name}</h3>
            <table>
                <caption>{objectInfos.labels.priorityTable}</caption>
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
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}