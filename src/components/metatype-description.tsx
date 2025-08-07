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
                            <th>{objectInfos.labels.attribute}</th>
                            <th>{objectInfos.labels.startFinalValues}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {objectInfos.attributes.body}
                            </td>
                            <td>
                                {attributes.body}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.agility}
                            </td>
                            <td>
                                {attributes.agility}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.reaction}
                            </td>
                            <td>
                                {attributes.reaction}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.strength}
                            </td>
                            <td>
                                {attributes.strength}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.willpower}
                            </td>
                            <td>
                                {attributes.willpower}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.logic}
                            </td>
                            <td>
                                {attributes.logic}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.intuition}
                            </td>
                            <td>
                                {attributes.intuition}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.charisma}
                            </td>
                            <td>
                                {attributes.charisma}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {objectInfos.attributes.edge}
                            </td>
                            <td>
                                {attributes.edge}
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