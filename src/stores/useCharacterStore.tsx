import { create } from "zustand";
import type { Character} from "../stores/currentCharacter"; // ajuste o caminho
import type { MetatypeCardProps } from "./metatypes";

// Estado inicial do personagem
const initialCharacter: Character = {
  bio: {
    name: "",
    metatype: {} as MetatypeCardProps,
    ethnicity: "",
    age: 0,
    sex: "",
    height: 0,
    weight: 0,
    streetCredit: 0,
    notoriety: 0,
    publicAwareness: 0,
    availableKarma: 0,
    totalKarma: 0,
    misc: ""
  },
  attributes: {
    strength: 0,
    agility: 0,
    logic: 0,
    charisma: 0,
    reaction: 0,
    intuition: 0,
    willpower: 0,
    body: 0,
    edge: 0,
    essence: 0,
    magic: 0
  },
  priorities:{
    metatype: '',
    attributes: '',
    magicOrRessonance: '',
    skills: '',
    resources: '',
  },
  traits: [],
  activeSkills: [],
  knowlodgeSkills: [],
  languageSkills: [],
  conditionMonitor: {
    currentPhysicalDamage: 0,
    maxPhysicalDamage: 0,
    currentStunDamage: 0,
    maxStunDamage: 0
  },
  qualities: []
};

type CharacterStore = {
  character: Character;
  setMetatype: (metatype: MetatypeCardProps) => void;
  setAttribute: (attr: keyof Character["attributes"], value: number) => void;
  updateBio: (key: keyof Character["bio"], value: any) => void;
  resetCharacter: () => void;
};

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: initialCharacter,

  setMetatype: (metatype) =>
    set((state) => ({
      character: {
        ...state.character,
        bio: { ...state.character.bio, metatype }
      }
    })),

  setAttribute: (attr, value) =>
    set((state) => ({
      character: {
        ...state.character,
        attributes: { ...state.character.attributes, [attr]: value }
      }
    })),

  updateBio: (key, value) =>
    set((state) => ({
      character: {
        ...state.character,
        bio: { ...state.character.bio, [key]: value }
      }
    })),

  resetCharacter: () => set({ character: initialCharacter })
}));
