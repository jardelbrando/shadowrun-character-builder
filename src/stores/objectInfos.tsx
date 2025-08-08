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
        }
    }
}