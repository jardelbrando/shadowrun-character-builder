import { useState } from 'react';
import '../styles/progressBar.css';

type Props = {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressBar({currentStep, totalSteps}: Props){

    const percentage = ((currentStep + 1) / totalSteps) *100;

    return(
        <div className="progress-container">
            <div className="progress-label">
                Etapa {currentStep+1} de {totalSteps}
            </div>
            <div className="progress-bar">
                <div className="progress-fill" style={{width: `${percentage}%`}}>
                </div>
            </div>
        </div>
    );
}