import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Increase screenshot timeout to prevent failures
    execTimeout: 15000,
    supportFile: "e2e/support/e2e.ts",
    specPattern: "e2e/**/*.cy.{js,jsx,ts,tsx}",
    fixturesFolder: "e2e/fixtures",
  },

});
