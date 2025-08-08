import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import { useCharacterStore } from "../stores/useCharacterStore";

type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function PriorityStep({ onNext , onBack}: Props){

    const metatype = useCharacterStore((state) => state.character.bio.metatype);

    return(
        <div>
            <p>Prioridade</p>
            <h3>Metatype Selected: {metatype.name}</h3>
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}