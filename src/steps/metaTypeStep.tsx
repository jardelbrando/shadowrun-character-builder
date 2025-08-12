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
    const setMetatypeAttributes = useCharacterStore((state) => state.setAttribute);
    const [selectedMetatype, setSelectedMetatype] = useState<string>("Human");   

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
                                className={`metatype-buttons ${selectedMetatype === meta.name ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedMetatype(meta.name);
                                    

                                    Object.entries(meta.attributes).forEach(([key, value]) => {
                                        if (typeof value === "object" && value !== null && "min" in value) {
                                            setMetatypeAttributes(key as keyof typeof meta.attributes, value.min);
                                        } else {
                                            setMetatypeAttributes(key as keyof typeof meta.attributes, value as number);
                                        }
                                    });

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
