import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import { useCharacterStore } from "../stores/useCharacterStore";

type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function AttributesStep({ onNext , onBack}: Props){

    const priorities = useCharacterStore((state) => state.character.priorities);

    return(
        <div>
            <p>Atributos</p>
            {Object.entries(priorities).map(([key, value]) => (
                <p key={key}>
                    {key}: {value}
                </p>
            ))}
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}