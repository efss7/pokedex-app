/**
 * Tudo roda DENTRO do lint-staged de propósito.
 *
 * O lint-staged guarda as mudanças não staged antes de executar as tarefas e
 * as restaura depois. Rodar `tsc` e `jest` fora dele (direto no hook, depois
 * do `npx lint-staged`) significa verificar a árvore de trabalho, e não o
 * snapshot que está sendo commitado: dá para stagear código quebrado, corrigir
 * só na árvore, e o commit passar. O inverso também acontece — um WIP não
 * staged em outro arquivo reprovava um commit perfeitamente válido.
 *
 * As funções devolvem o comando sem a lista de arquivos, então `tsc` e `jest`
 * rodam uma vez só, no projeto inteiro (um erro de tipo ou um teste quebrado
 * raramente fica contido no arquivo que foi mexido).
 */
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings=0',
    () => 'tsc --noEmit',
    () => 'jest --silent --ci',
  ],
};
