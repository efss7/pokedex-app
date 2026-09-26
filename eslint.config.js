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
       * Desligada, não rebaixada a aviso: um aviso permanente é ruído que
       * ninguém lê, e mascara violações novas.
       *
       * A regra dispara em `useRef(new Animated.Value(0)).current`, o idioma
       * documentado do React Native para valores animados (29 ocorrências em
       * 6 arquivos). O objeto é estável e não participa da render — ler
       * `.current` ali não causa o bug que a regra existe para pegar. Se um
       * dia a Animated API do RN mudar, vale reavaliar.
       */
      'react-hooks/refs': 'off',
    },
  },
  {
    // O setup do Jest é CommonJS e roda em Node, com os globais do Jest.
    files: ['jest.setup.js', 'jest.config.js', 'lint-staged.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        jest: 'readonly',
        afterEach: 'readonly',
        beforeEach: 'readonly',
        require: 'readonly',
        module: 'writable',
        console: 'readonly',
      },
    },
  },
]);
