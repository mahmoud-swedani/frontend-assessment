/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for page to be ready
       * @example cy.waitForPageReady()
       */
      waitForPageReady(): Chainable<void>;

      /**
       * Custom command to search for team members
       * @example cy.searchTeamMembers('john')
       */
      searchTeamMembers(query: string): Chainable<void>;

      /**
       * Custom command to filter by role
       * @example cy.filterByRole('Admin')
       */
      filterByRole(role: 'Admin' | 'Agent' | 'Creator'): Chainable<void>;

      /**
       * Custom command to clear all filters
       * @example cy.clearFilters()
       */
      clearFilters(): Chainable<void>;

      /**
       * Custom command to clear role filter (select "All Roles")
       * @example cy.clearRoleFilter()
       */
      clearRoleFilter(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('waitForPageReady', () => {
  cy.get('body').should('be.visible');
  cy.window().its('document.readyState').should('eq', 'complete');
});

Cypress.Commands.add('searchTeamMembers', (query: string) => {
  cy.get('input[aria-label*="search" i]').type(query);
  // Wait for debounce
  cy.wait(350);
});

Cypress.Commands.add('filterByRole', (role: 'Admin' | 'Agent' | 'Creator') => {
  // Click the select trigger
  cy.get('button[aria-label*="filter by role" i]').click();
  
  // Wait for dropdown to be visible (Radix UI portal)
  // Radix UI Select uses [role="listbox"] for the content
  cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');
  
  // Wait a bit for animations and pointer-events to be set up
  cy.wait(300);
  
  // Radix UI SelectItem doesn't use data-value attribute
  // Select by text content within the listbox - Cypress will find the element containing the role text
  cy.get('[role="listbox"]').contains(role, { timeout: 5000 }).click({ force: true });
  
  // Wait for dropdown to close and body to be unlocked
  cy.get('[role="listbox"]').should('not.exist');
  cy.get('body').should('not.have.attr', 'data-scroll-locked');
  
  // Wait for filter to apply
  cy.wait(500);
});

Cypress.Commands.add('clearFilters', () => {
  // Find and click the clear filters button
  cy.get('button').contains(/clear.*filter/i).click();
});

Cypress.Commands.add('clearRoleFilter', () => {
  // Click the role filter button to open dropdown
  cy.get('button[aria-label*="filter by role" i]').click();
  
  // Wait for dropdown
  cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');
  cy.wait(300);
  
  // Select "All Roles" option - use same pattern as filterByRole
  // Find option by text within listbox, targeting role="option" elements
  cy.get('[role="listbox"]')
    .contains('[role="option"]', 'All Roles', { timeout: 5000 })
    .click({ force: true });
  
  // Wait for dropdown to close
  cy.get('[role="listbox"]').should('not.exist');
  cy.get('body').should('not.have.attr', 'data-scroll-locked');
  
  // Wait for filter to apply
  cy.wait(500);
});

export {};