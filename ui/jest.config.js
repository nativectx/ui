const expoPreset = require('jest-expo/jest-preset');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // pnpm hoists node_modules to the monorepo root. jest-expo resolves its setup
  // files relative to rootDir, so rootDir must be the root that owns
  // node_modules — then scope test discovery back down to this package.
  rootDir: '..',
  testMatch: ['<rootDir>/ui/**/*.test.{ts,tsx}'],
  // dist/ holds compiled copies of the same suites.
  modulePathIgnorePatterns: ['<rootDir>/ui/dist/'],
  // @material/material-color-utilities ships ESM only, so it needs transforming
  // like the RN packages jest-expo already allows through.
  transformIgnorePatterns: [
    expoPreset.transformIgnorePatterns[0].replace(
      '|standard-navigation))',
      '|standard-navigation|@material/material-color-utilities))',
    ),
    ...expoPreset.transformIgnorePatterns.slice(1),
  ],
  // @testing-library/react-native v13 ships its matchers built in — no extend-expect needed.
  collectCoverageFrom: ['<rootDir>/ui/**/*.{ts,tsx}', '!**/*.d.ts', '!**/dist/**', '!**/*.test.{ts,tsx}'],
};
