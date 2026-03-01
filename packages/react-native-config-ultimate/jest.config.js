module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text", "lcov", "clover"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "example", "test_outputs", "e2e"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: false,
      },
    }],
  },
};
