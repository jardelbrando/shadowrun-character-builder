import dwarveImg from '../assets/images/dwarve.JPG';
import elfImg from '../assets/images/elf.JPG';
import humanImg from '../assets/images/human.JPG';
import orkImg from '../assets/images/ork.JPG';
import trollImg from '../assets/images/troll.JPG'

export type MetatypeCardProps = {
    name: string;
    attributes: {
        strength: string;
        agility: string;
        logic: string;
        charisma: string;
        reaction: string;
        intuition: string;
        willpower: string;
        body: string;
        edge: string;
        essence: string;
        
  };
  imageUrl: string;
  traits: string[];
  onSelect?: () => void;
}

export const metatypes: MetatypeCardProps[] = [
    {
        name: 'Dwarven',
        attributes: {
        body: '3 / 8',
        agility: '1 / 6',
        reaction: '1 / 5',
        strength: '3 / 8',
        willpower: '2 / 7',
        logic: '1 / 6',
        intuition: '1 / 6',
        charisma: '1 / 6', 
        edge: '1 / 6',
        essence: '6',
        
        },
        imageUrl: dwarveImg,
        traits: ['Thermographic Vision','	+2 dice to resist pathogens and toxins', '+20% increase to Lifestyle costs']
        
    },
    {
        name: 'Elf',
        attributes: {
        body: '1 / 6',
        agility: '2 / 7',
        reaction: '1 / 6',
        strength: '1 / 6',
        willpower: '1 / 6',
        logic: '1 / 6',
        intuition: '1 / 6',
        charisma: '3 / 8',
        edge: '1 / 6',
        essence: '6',
        },
            imageUrl: elfImg,
        traits: ['Low-Light Vision']
        
    },
    {
        name: 'Human',
        attributes: {
        body: '1 / 6',
        agility: '1 / 6',
        reaction: '1 / 6',
        strength: '1 / 6',
        willpower: '1 / 6',
        logic: '1 / 6',
        intuition: '1 / 6',
        charisma: '1 / 6',
        edge: '2 / 7',
        essence: '6',
        },
            imageUrl: humanImg,
        traits: ['None']
        
    },
    {
        name: 'Ork',
        attributes: {
        body: '4 / 9',
        agility: '1 / 6',
        reaction: '1 / 6',
        strength: '3 / 8',
        willpower: '1 / 6',
        logic: '1 / 5',
        intuition: '1 / 6',
        charisma: '1 / 5',
        edge: '1 / 6',
        essence: '6',
        },
            imageUrl: orkImg,
        traits: ['Low-Light Vision']
    },
    {
        name: 'Troll',
        attributes: {
        body: '5 / 10',
        agility: '1 / 5',
        reaction: '1 / 6',
        strength: '5 / 10',
        willpower: '1 / 6',
        logic: '1 / 5',
        intuition: '1 / 5',
        charisma: '1 / 4',
        edge: '1 / 6',
        essence: '6',
        },
        imageUrl: trollImg,
        traits: ['Thermographic Vision','+1 reach','+1 Dermal Armor', '+100% increase to Lifestyle costs']
    },
    
];