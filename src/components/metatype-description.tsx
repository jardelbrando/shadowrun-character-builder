import '../styles/metaType.css';
import '../styles/global.css';
import type {MetatypeCardProps} from '../stores/metatypes';
import { objectInfos } from '../stores/objectInfos';

export default function MetatypeDescription({ name, attributes, imageUrl, traits, onSelect }: MetatypeCardProps){

    return(
        <div className="metatype-card" onClick={onSelect}>
            <div className='metatype-status centralize-column-content'>
                <h2>{name}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>{objectInfos.labels.attributes}</th>
                            <th>{objectInfos.labels.startFinalValues}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {objectInfos.attributes.body}
                            </td>
                            <td>
                                {attributes.body.min} / {attributes.body.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.agility}
                            </td>
                            <td>
                                {attributes.agility.min} / {attributes.agility.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.reaction}
                            </td>
                            <td>
                                {attributes.reaction.min} / {attributes.reaction.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.strength}
                            </td>
                            <td>
                                {attributes.strength.min} / {attributes.strength.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.willpower}
                            </td>
                            <td>
                                {attributes.willpower.min} / {attributes.willpower.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.logic}
                            </td>
                            <td>
                                {attributes.logic.min} / {attributes.logic.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.intuition}
                            </td>
                            <td>
                                {attributes.intuition.min} / {attributes.intuition.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.charisma}
                            </td>
                            <td>
                                {attributes.charisma.min} / {attributes.charisma.max}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.edge}
                            </td>
                            <td>
                                {attributes.edge.min} / {attributes.edge.max}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p><strong>Traits:</strong> {traits.join(', ')}</p>
            </div>
            <div className='metatype-img'>
                <img className='border-image' src={imageUrl}></img>
            </div>
            
            
        </div>
    );
    
}