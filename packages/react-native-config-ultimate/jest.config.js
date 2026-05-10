module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/templates/**'],
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text", "lcov", "clover"],
  coverageThreshold: {
    global: {
      lines: 88,
      branches: 82,
    },
  },
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/lib/", "/example/", "/test_outputs/", "/e2e/"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
      },
    }],
  },
};
