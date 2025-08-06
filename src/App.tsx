import { useState } from 'react';
import './styles/App.css';
import ProgressBar from './components/progressBar';
import AttributesStep from './steps/attributesStep';
import MetatypeStep from './steps/metaTypeSetp';
import PriorityStep from './steps/priorityStep';

function App() {
  const [count, setCount] = useState(0)

  const [step, setStep] = useState(0);

  const goToNextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goToPrevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    <MetatypeStep onNext={goToNextStep} onBack={goToPrevStep}/>,
    <PriorityStep onNext={goToNextStep} onBack={goToPrevStep}/>,
    <AttributesStep onNext={goToNextStep} onBack={goToPrevStep} />,
  ];

  return (
    <>
      <div className='app'>
        <h1 className='title-home'>Shadowrun Character Builder</h1>
        <ProgressBar currentStep={step} totalSteps={steps.length} />
        {steps[step]}
      </div>
    </>
  )
}

export default App
