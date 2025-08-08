import { useState } from 'react';
import '../styles/App.css';
import ProgressBar from '../components/progressBar';
import AttributesStep from '../steps/attributesStep';
import MetatypeStep from '../steps/metaTypeStep';
import PriorityStep from '../steps/priorityStep';
import { useNavigate } from 'react-router-dom';  // importar o useNavigate

export default function StepsManager(){
    
    const [step, setStep] = useState(0);
    const navigate = useNavigate();
    
    const goToNextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
    const goToPrevStep = () => {
      if(step === 0) {
        navigate('/');  // volta pra home
      } else {
        setStep((prev) => Math.max(prev - 1, 0));
      }
    };
    const steps = [
        <MetatypeStep onNext={goToNextStep} onBack={goToPrevStep}/>,
        <PriorityStep onNext={goToNextStep} onBack={goToPrevStep}/>,
        <AttributesStep onNext={goToNextStep} onBack={goToPrevStep} />,
    ];
    
    return(
        <>
            <div className='app'>
                <h1 className='title-home'>Shadowrun Character Builder</h1>
                <ProgressBar currentStep={step} totalSteps={steps.length} />
                {steps[step]}
            </div>
        </>        
    );
}