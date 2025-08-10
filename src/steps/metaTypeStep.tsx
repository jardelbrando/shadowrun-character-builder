import { useState } from 'react';
import '../styles/global.css';
import '../styles/genericStepStyle.css';
import '../styles/metaType.css';
import MetatypeDescription from '../components/metatype-description';
import { metatypes } from '../stores/metatypes';
import { useCharacterStore } from '../stores/useCharacterStore';

type Props = {
        onNext: () => void;
        onBack: () => void;
};

export default function MetatypeStep({ onNext, onBack }: Props){

    const setMetatype = useCharacterStore((state) => state.setMetatype);
    const [selectedMetatype, setSelectedMetatype] = useState<string>();   

    return(
        <div className='step-card'>
            <div>
                <h2>Metatype</h2>
                <div>
                    <p>Select the desired metatype for your character</p>
                    <div>
                        {metatypes.map((meta) => (
                            <button
                            key={meta.name}
                            className='metatype-buttons'
                            onClick={() => {
                                setSelectedMetatype(meta.name);
                                setMetatype(meta);
                            }}
                            >
                            {meta.name}
                            </button>
                        ))}
                    </div>
                    {selectedMetatype && (() => {
                        const selected = metatypes.find((meta) => meta.name === selectedMetatype);
                        if (!selected) return null;

                        return (
                            <MetatypeDescription
                            name={selected.name}
                            attributes={selected.attributes}
                            imageUrl={selected.imageUrl}
                            traits={selected.traits}
                            />
                        );
                        })()}
                </div>
            </div>
            
            <div className="navigation-progress">
                <button className="button-generic" onClick={onBack}>Voltar</button>
                <button className="button-generic" onClick={onNext} disabled={!selectedMetatype}>Próximo</button>
            </div>
        </div>
    );
}
