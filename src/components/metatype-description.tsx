import '../styles/metaType.css';

type MetatypeCardProps = {
    name: string;
    attributes: {
        strength: number;
        agility: number;
        logic: number;
        charisma: number;
        reaction: number;
        intuition: number;
        willpower: number;
        body: number;
    // adicione o que precisar
  };
  traits: string[];
  onSelect?: () => void;
}

export default function MetatypeDescription({ name, attributes, traits, onSelect }: MetatypeCardProps){

    return(
        <div className="metatype-card" onClick={onSelect}>
            <h3>{name}</h3>
            <ul>
                <li><strong>Body:</strong> {attributes.body}</li>
                <li><strong>Agility:</strong> {attributes.agility}</li>
                <li><strong>Reaction:</strong> {attributes.reaction}</li>
                <li><strong>Strength:</strong> {attributes.strength}</li>
                <li><strong>Willpower:</strong> {attributes.willpower}</li>
                <li><strong>Logic:</strong> {attributes.logic}</li>
                <li><strong>Intuition:</strong> {attributes.intuition}</li>
                <li><strong>Charisma:</strong> {attributes.charisma}</li>
            </ul>
            <p><strong>Traits:</strong> {traits.join(', ')}</p>
        </div>
    );
    
}