import '../styles/metaType.css';
import '../styles/global.css';
import type {MetatypeCardProps} from '../stores/metatypes';

export default function MetatypeDescription({ name, attributes, imageUrl, traits, onSelect }: MetatypeCardProps){

    return(
        <div className="metatype-card" onClick={onSelect}>
            <div className='metatype-status centralize-column-content'>
                <h3>{name}</h3>
                <ul className='centralize-column-content without-padding-margin'>
                    <li><strong>Body:</strong> {attributes.body}</li>
                    <li><strong>Agility:</strong> {attributes.agility}</li>
                    <li><strong>Reaction:</strong> {attributes.reaction}</li>
                    <li><strong>Strength:</strong> {attributes.strength}</li>
                    <li><strong>Willpower:</strong> {attributes.willpower}</li>
                    <li><strong>Logic:</strong> {attributes.logic}</li>
                    <li><strong>Intuition:</strong> {attributes.intuition}</li>
                    <li><strong>Charisma:</strong> {attributes.charisma}</li>
                    <li><strong>Edge:</strong> {attributes.edge}</li>
                </ul>
                <p><strong>Traits:</strong> {traits.join(', ')}</p>
            </div>
            <div className='metatype-img blue-neon-border'>
                <img src={imageUrl}></img>
            </div>
            
            
        </div>
    );
    
}