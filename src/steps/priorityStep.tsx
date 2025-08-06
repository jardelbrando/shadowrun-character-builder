import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';

type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function PriorityStep({ onNext , onBack}: Props){

    return(
        <div>
            <p>Prioridade</p>
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}