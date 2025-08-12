import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import { useCharacterStore } from "../stores/useCharacterStore";
import AttributeStepCounter from '../components/attributeStepCounter';

type Props = {
        onNext: () => void;
        onBack: () => void;
};


export default function AttributesStep({ onNext , onBack}: Props){

    const priorities = useCharacterStore((state) => state.character.priorities);
    const metatype = useCharacterStore((state) => state.character.bio.metatype);
    

    return(
        <div>
            <AttributeStepCounter
                name={metatype.name}
                attributes={Object.fromEntries(
                    Object.entries(metatype.attributes).map(([k, v]) => [k, Number(v)])
            )} />
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}