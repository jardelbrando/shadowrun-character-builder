export const objectInfos = {
    attributes: {
        body: 'Body',
        agility: 'Agility',
        reaction: 'Reaction',
        strength: 'Strength',
        willpower: 'Willpower',
        logic: 'Logic',
        intuition: 'Intuition',
        charisma: 'Charisma',
        edge: 'Edge',
        essence: 'Essence',
        magic: 'Magic'
    },
    labels: {
        attributes: 'Attributes',
        startFinalValues: 'Start Value / Max Value',
        title: 'Shadowrun Character Builder',
        homeText: 'This application aims to assist players of the tabletop RPG Shadowrun 5th edition in creating their characters on a non-profit basis.',
        startButton: 'Begin',
        priority: 'Priority',
        metatype: 'Metatype',
        magicOrRessonance: 'Magic or Ressonance',
        skills: 'Skills',
        resources: 'Resources',
        priorityTable: 'Priority Table',
        metatypeSelected: 'Metatype selected: ',
        category: "Category",
        selectOption: "Select one option",
        categories: ["Attributes", "Metatype", "Magic or Ressonance", "Skills", "Resources", ""]

    },
    priorityTable: {
        priorityA: {
            priority: 'A',
            metatype: {
                human: 9,
                elf: 8,
                dwarve: 7,
                ork: 7,
                troll: 5
            },
            attributes: 24,
            magicOrRessonance:{
                mageOrAdept: {
                    title: 'Mage or Adept',
                    description: 'Magic 6, two magic skills rating 5, 10 spells'
                },
                technomancer: {
                    title: 'Technomancer',
                    description: 'Ressonance 6, two ressonance skills rating 5, 5 complex forms'
                }                    
            },
            skills: '46/10',
            resources: 450000
        },
        priorityB: {
            priority: 'B',
            metatype: {
                human: 7,
                elf: 6,
                dwarve: 4,
                ork: 4,
                troll: 0
            },
            attributes: 20,
            magicOrRessonance:{
                mageOrAdept: {
                    title: 'Mage or Adept',
                    description: 'Magic 4, two magic skills rating 4, 7 spells'
                },
                technomancer: {
                    title: 'Technomancer',
                    description: 'Ressonance 4, two ressonance skills rating 4, 2 complex forms'
                },
                adept: {
                    title: 'Adept',
                    description: 'Magic 6, one active skill rating 4'
                },
                aspectMage: {
                    title: 'Aspect Mage',
                    description: 'Magic 5, one magic skill group rating 4'
                }                
            },
            skills: '38/5',
            resources: 275000
        },
        priorityC: {
            priority: 'C',
            metatype: {
                human: 5,
                elf: 3,
                dwarve: 1,
                ork: 0
            },
            attributes: 16,
            magicOrRessonance:{
                mageOrAdept: {
                    title: 'Mage or Adept',
                    description: 'Magic 3, 5 spells'
                },
                technomancer: {
                    title: 'Technomancer',
                    description: 'Ressonance 3, 1 complex form'
                },
                adept: {
                    title: 'Adept',
                    description: 'Magic 4, one active skill rating 2'
                },
                aspectMage: {
                    title: 'Aspect Mage',
                    description: 'Magic 3, one magic skill group rating 2'
                }                
            },
            skills: '28/2',
            resources: 140000
        },
        priorityD: {
            priority: 'D',
            metatype: {
                human: 3,
                elf: 0,
            },
            attributes: 14,
            magicOrRessonance:{
                adept: {
                    title: 'Adept',
                    description: 'Magic 2'
                },
                aspectMage: {
                    title: 'Aspect Mage',
                    description: 'Magic 2'
                }                
            },
            skills: '22/0',
            resources: 50000
        },
        priorityE: {
            priority: 'E',
            metatype: {
                human: 1,
            },
            attributes: 12,
            magicOrRessonance:{
                none:{
                    title: 'None',
                    description: 'none'
                }          
            },
            skills: '18/0',
            resources: 6000
        }
    }
}