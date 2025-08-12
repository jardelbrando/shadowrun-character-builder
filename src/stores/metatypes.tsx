import dwarveImg from '../assets/images/dwarve.JPG';
import elfImg from '../assets/images/elf.JPG';
import humanImg from '../assets/images/human.JPG';
import orkImg from '../assets/images/ork.JPG';
import trollImg from '../assets/images/troll.JPG'

export type MetatypeCardProps = {
    name: string;
    attributes: {
        strength: {
            min: number;
            max: number;
        }
        agility: {
            min: number;
            max: number;
        }
        logic: {
            min: number;
            max: number;
        }
        charisma: {
            min: number;
            max: number;
        }
        reaction: {
            min: number;
            max: number;
        }
        intuition: {
            min: number;
            max: number;
        }
        willpower: {
            min: number;
            max: number;
        }
        body: {
            min: number;
            max: number;
        }
        edge: {
            min: number;
            max: number;
        }
        essence: number
  };
  imageUrl: string;
  traits: string[];
  onSelect?: () => void;
}

export const metatypes: MetatypeCardProps[] = [
    {
        name: 'Dwarven',
        attributes: {
        body: {
            min: 3,
            max: 8
        },
        agility: {
            min: 1,
            max: 6
        },
        reaction: {
            min: 1,
            max: 5
        },
        strength: {
            min: 3,
            max: 8
        },
        willpower: {
            min: 2,
            max: 7
        },
        logic: {
            min: 1,
            max: 6
        },
        intuition: {
            min: 1,
            max: 6
        },
        charisma: {
            min: 1,
            max: 6
        }, 
        edge: {
            min: 1,
            max: 6
        },
        essence: 6,
        
        },
        imageUrl: dwarveImg,
        traits: ['Thermographic Vision','	+2 dice to resist pathogens and toxins', '+20% increase to Lifestyle costs']
        
    },
    {
        name: 'Elf',
        attributes: {
        body: {
            min: 1,
            max: 6
        },
        agility: {
            min: 2,
            max: 7
        },
        reaction: {
            min: 1,
            max: 6
        },
        strength: {
            min: 1,
            max: 6
        },
        willpower: {
            min: 1,
            max: 6
        },
        logic: {
            min: 1,
            max: 6
        },
        intuition: {
            min: 1,
            max: 6
        },
        charisma: {
            min: 3,
            max: 8
        },
        edge: {
            min: 1,
            max: 6
        },
        essence: 6,
        },
            imageUrl: elfImg,
        traits: ['Low-Light Vision']
        
    },
    {
        name: 'Human',
        attributes: {
        body: {
            min: 1,
            max: 6
        },
        agility: {
            min: 1,
            max: 6
        },
        reaction: {
            min: 1,
            max: 6
        },
        strength: {
            min: 1,
            max: 6
        },
        willpower: {
            min: 1,
            max: 6
        },
        logic: {
            min: 1,
            max: 6
        },
        intuition: {
            min: 1,
            max: 6
        },
        charisma: {
            min: 1,
            max: 6
        },
        edge: {
            min: 2,
            max: 7
        },
        essence: 6,
        },
            imageUrl: humanImg,
        traits: ['None']
        
    },
    {
        name: 'Ork',
        attributes: {
        body: {
            min: 4,
            max: 9
        },
        agility: {
            min: 1,
            max: 6
        },
        reaction: {
            min: 1,
            max: 6
        },
        strength: {
            min: 3,
            max: 8
        },
        willpower: {
            min: 1,
            max: 6
        },
        logic: {
            min: 1,
            max: 5
        },
        intuition: {
            min: 1,
            max: 6
        },
        charisma: {
            min: 1,
            max: 5
        },
        edge: {
            min: 1,
            max: 6
        },
        essence: 6,
        },
            imageUrl: orkImg,
        traits: ['Low-Light Vision']
    },
    {
        name: 'Troll',
        attributes: {
        body: {
            min: 5,
            max: 10
        },
        agility: {
            min: 1,
            max: 5
        },
        reaction: {
            min: 1,
            max: 6
        },
        strength: {
            min: 5,
            max: 10
        },
        willpower: {
            min: 1,
            max: 6
        },
        logic: {
            min: 1,
            max: 5
        },
        intuition: {
            min: 1,
            max: 5
        },
        charisma: {
            min: 1,
            max: 4
        },
        edge: {
            min: 1,
            max: 6
        },
        essence: 6,
        },
        imageUrl: trollImg,
        traits: ['Thermographic Vision','+1 reach','+1 Dermal Armor', '+100% increase to Lifestyle costs']
    },
    
];