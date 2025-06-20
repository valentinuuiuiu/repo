

module.exports = {
  displayName: 'Agent Tests',
  testMatch: [
    '**/src/lib/ai/agents/__tests__/**/*.test.ts',
    '**/src/lib/ai/agents/__tests__/**/*.spec.ts',
    '**/__tests__/**/*.test.ts'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.agent.setup.cjs'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@/types/schema': '<rootDir>/src/types/schema.ts', 
    '@/(.*)': '<rootDir>/src/$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        
        tsconfig: '<rootDir>/tsconfig.json'
      }
    ]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-transform)/)'
  ]
};

