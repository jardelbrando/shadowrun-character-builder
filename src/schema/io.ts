import { characterSchema, type Character } from './character';

export type ImportResult = { ok: true; character: Character } | { ok: false; errors: string[] };

export function parseCharacter(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['O arquivo não é um JSON válido.'] };
  }
  const result = characterSchema.safeParse(raw);
  if (result.success) return { ok: true, character: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.') || 'raiz'}: ${issue.message}`),
  };
}

export const serializeCharacter = (character: Character) => JSON.stringify(character, null, 2);

export function downloadCharacter(character: Character) {
  const url = URL.createObjectURL(new Blob([serializeCharacter(character)], { type: 'application/json' }));
  const link = document.createElement('a');
  const name = character.personal.alias.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-') || 'runner';
  link.href = url;
  link.download = `${name}.sr5.json`;
  link.click();
  URL.revokeObjectURL(url);
}
