/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Os aliases (@hooks, @services, …) são reescritos pelo babel-plugin-module-resolver
  // no transform, então não precisam de moduleNameMapper aqui.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
};
