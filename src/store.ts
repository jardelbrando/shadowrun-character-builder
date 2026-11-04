import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { derive } from './engine/derive';
import { validate } from './engine/validate';
import { characterSchema, newCharacter, type Character } from './schema/character';

interface CharacterStore {
  character: Character;
  edit: (recipe: (draft: Character) => void) => void;
  load: (character: Character) => void;
  reset: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: newCharacter(),
      edit: (recipe) =>
        set((state) => {
          const draft = structuredClone(state.character);
          recipe(draft);
          return { character: draft };
        }),
      load: (character) => set({ character }),
      reset: () => set({ character: newCharacter() }),
    }),
    {
      name: 'sr5-character',
      partialize: (state) => ({ character: state.character }),
      // Rascunhos salvos que não passam no schema são descartados.
      merge: (persisted, current) => {
        const parsed = characterSchema.safeParse((persisted as Partial<CharacterStore> | undefined)?.character);
        return parsed.success ? { ...current, character: parsed.data } : current;
      },
    },
  ),
);

export function useCharacter() {
  const character = useCharacterStore((state) => state.character);
  const edit = useCharacterStore((state) => state.edit);
  const derived = useMemo(() => derive(character), [character]);
  const issues = useMemo(() => validate(character, derived), [character, derived]);
  return { character, edit, derived, issues };
}

export const newId = () => crypto.randomUUID();
