// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'coverage/*'],
  },
  {
    rules: {
      /**
       * Regras novas do React Compiler, rebaixadas a aviso em vez de erro para
       * o lint poder entrar no pre-commit sem exigir um refactor amplo antes.
       * Seguem visíveis de propósito — são dívida anotada, não decisão final.
       *
       * react-hooks/refs: dispara em `useRef(new Animated.Value(0)).current`,
       * que é o idioma documentado do React Native para valores animados (29
       * ocorrências). O valor é estável e não participa da render, então aqui
       * é ruído da regra, não bug.
       *
       * react-hooks/static-components: componentes declarados dentro de outro
       * componente (os `Block` dos skeletons). É crítica legítima — remontam o
       * subtree a cada render do pai —, mas sem impacto visível em skeletons.
       * Vale extrair quando esses componentes forem mexidos.
       */
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  {
    // Os arquivos de teste e a config do Jest rodam em Node, com globais do Jest.
    files: ['**/*.test.{ts,tsx}', 'jest.setup.js', 'jest.config.js', 'src/test-utils.tsx'],
    languageOptions: {
      globals: { jest: 'readonly', __DEV__: 'readonly' },
    },
  },
]);
