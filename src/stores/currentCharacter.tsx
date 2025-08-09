import type { MetatypeCardProps } from "./metatypes";

type Skill = {
    id: number;
    name: string;
    rating: number;
    especialization: boolean;
    modifier: number;
    description: string;
}

type Quality = {
    id: number;
    name: string;
    description: string;
    positiveNegative: boolean;
    effects: {
        target: {
            id: string
            type: string
        }
        operation: number;
        value: number        
    }
}

export type Character = {
    bio: {
        name: string;
        metatype: MetatypeCardProps;
        ethnicity: string;
        age: number;
        sex: string;
        height: number;
        weight: number;
        streetCredit: number;
        notoriety: number;
        publicAwareness: number;
        availableKarma: number;
        totalKarma: number;
        misc: string;
    }
    attributes: {
        strength: number;
        agility: number;
        logic: number;
        charisma: number;
        reaction: number;
        intuition: number;
        willpower: number;
        body: number;
        edge: number;
        essence: number;
        magic: number;
    };
    priorities:{
        metatype: string;
        attributes: string;
        magicOrRessonance: string;
        skills: string;
        resources: string;
    };
    traits: string[];
    activeSkills: Skill[];
    knowlodgeSkills: Skill[];
    languageSkills: Skill[];
    conditionMonitor: {
        currentPhysicalDamage: number;
        maxPhysicalDamage: number;
        currentStunDamage: number;
        maxStunDamage: number;
    }
    qualities: Quality[];
}

