const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/api/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  env: {
  },
});
