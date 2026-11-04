/** Formato do livro para valores ampliados: "9 (11) + 2D6". */
export const augmentedText = (natural: number, augmented: number) => (natural === augmented ? `${natural}` : `${natural} (${augmented})`);

export const initiativeText = (natural: number, augmented: number, dice: number) => `${augmentedText(natural, augmented)} + ${dice}D6`;
