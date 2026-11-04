# Shadowrun 5 · Criador de Ficha

Criador de personagem para Shadowrun 5ª Edição, sem backend. O personagem é um JSON que pode ser exportado e importado, e o rascunho fica salvo no navegador.

## Como rodar

Requer Node.js LTS.

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm test
npm run build
```

O build gera em `dist/` um site estático, que pode ser publicado em qualquer hospedagem de arquivos.

## Stack

React, TypeScript e Vite · Zustand (estado) · Zod (validação do JSON) · Motion (animações) · Tailwind CSS (tema) · Radix UI (selects e diálogos) · Vitest (testes).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/data/` | Regras do livro em JSON: prioridades, meta-tipos, perícias, qualidades, feitiços, formas complexas, poderes, programas, tradições e estilos de vida |
| `src/schema/` | Formato do personagem e importação/exportação |
| `src/engine/derive.ts` | Cálculos: pontos, Carma, neoienes, Essência, limites, Iniciativa e monitores |
| `src/engine/validate.ts` | Regras de criação, com pendências agrupadas por etapa |
| `src/engine/book-examples.test.ts` | Testes com os exemplos do livro (Jefferson, Beto e Clara) |
| `src/data/catalog.json` | 454 itens do livro: armas, acessórios, armaduras, eletrônicos, ferramentas, veículos, ciber-itens e biônicos. É carregado só ao abrir a etapa de Recursos |
| `src/engine/catalog.ts` | Monta o item escolhido: Nível, classe, Capacidade e modificações |
| `src/engine/megacorp.ts` | Escolhe a megacorp de cada etapa e a que vigia o personagem, com dados em `src/data/megacorps.json` |
| `src/steps/` | As nove etapas do livro |
| `src/sheet/` | Ficha final, também usada na impressão |

O JSON exportado guarda só as escolhas do jogador. Valores derivados são sempre recalculados, então nunca ficam inconsistentes com os dados. Ao mudar o formato, suba `SCHEMA_VERSION` em `src/schema/character.ts` e trate a migração em `src/schema/io.ts`.

## Onde o PDF se contradiz

O texto do PDF tem inconsistências. Estas foram as decisões tomadas:

| Assunto | O que o PDF diz | Decisão |
|---|---|---|
| Pontos de Poder do adepto místico | 5 Carma no texto e no exemplo; 2 Carma na lista de verificação | 5 Carma |
| Dano de Nocaute, Raio de Atordoamento e Esfera de Atordoamento | `Dano: F`, apesar do nome | Mantido como está no PDF. Provável erro de tradução; confira na mesa |
| Iniciativa de RV de Jefferson | O exemplo mostra 10; a fórmula (Processamento de Dados + Intuição) dá 8 | Fórmula da tabela |
| Controle Vocal | 0,5 PP por nível na lista; 0,25 no exemplo, com o nome Controle de Voz | 0,5 PP por nível |
| Custo extra de anões e trolls | A tabela fala em Estilo de Vida; o exemplo de Beto e a lista de verificação citam também equipamentos | Só Estilo de Vida |
| Sprites | O exemplo cita "Sprite Excelente", que não existe na lista | Usa os cinco tipos da lista |
| Carma de Beto no exemplo | 15 em um trecho, 16 em outro | Sem efeito no cálculo |

Interpretação própria, porque o livro não é explícito: nos níveis Rua e Principal, "máximo de 26/70 de Carma" virou um limite de 13/35 para qualidades positivas e para negativas, como os 25 do nível padrão.

Confira no livro: os resumos de **Vitalidade** e **Arrasado** apontam para a descrição original, e **Terreno Familiar** tem a opção genérica "Outro bônus do livro", porque esse trecho não saiu legível na extração de texto.

## Ainda não incluído

- Catálogo de rituais e preparativos: hoje são campos livres, com custo e limite aplicados.
- Dividir grupos de perícias na Etapa 7.
- Progressão depois da criação e iniciação/submersão.
- Efeitos situacionais de equipamentos: os itens registram o efeito na descrição, mas só bônus permanentes entram nos cálculos.
- Personalização de cibermembros: a tabela de Força e Agilidade acima de 3 ainda não está no catálogo.

## Direitos autorais

Shadowrun é marca de seus detentores. Este projeto guarda nomes e valores mecânicos para uso pessoal. Antes de publicar, confira a política de fãs da detentora.
