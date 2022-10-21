module.exports = {
  verbose: false,
  testEnvironment: "jsdom",
  roots: ["test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleDirectories: ["node_modules", "src"],
  globalSetup: "./test/global-test-setup.js",
  setupFilesAfterEnv: ["./test/polyfill/array.find.polyfill.js", "./test/tests.entry.js"],
  moduleNameMapper: {
    "^react-dom((\\/.*)?)$": "react-dom-17$1",
    "^react((\\/.*)?)$": "react-17$1",
  },
};
