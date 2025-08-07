import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import '../styles/metaType.css';
import MetatypeDescription from '../components/metatype-description';

type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function MetatypeStep({ onNext, onBack }: Props){

    const metatypes = [
        {
            name: 'Dwarven',
            attributes: {
            body: 3,
            agility: 1,
            reaction: 1,
            strength: 3,
            willpower: 2,
            logic: 1,
            intuition: 1,
            charisma: 1 
        // adicione o que precisar
            },
            traits: ['Adaptável','Sem penalidades']
            
        }
    ];

    return(
        <div className='step-card'>
            <div>
                <h2>Metatipo</h2>
                <div>
                    <p>Escolha um metatipo para seu personagem</p>
                    <div>
                        <button className='metatype-buttons'>Anão</button>
                        <button className='metatype-buttons'>Elfo</button>
                        <button className='metatype-buttons'>Humano</button>
                        <button className='metatype-buttons'>Ork</button>
                        <button className='metatype-buttons'>Troll</button>
                    </div>
                    {metatypes.map((meta) => (
                    <MetatypeDescription
                        key={meta.name}
                        name={meta.name}
                        attributes={meta.attributes}
                        traits={meta.traits}
                        onSelect={() => console.log(`Selecionou: ${meta.name}`)}
                        />
                    ))}
                </div>
            </div>
            
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext}>Próximo</button>
            </div>
        </div>
    );
}