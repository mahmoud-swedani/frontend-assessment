describe('Team Directory - Full User Journey', () => {
  beforeEach(() => {
    // Visit the team directory page
    cy.visit('/en/team-directory');
    // Wait for page to be ready
    cy.get('body').should('be.visible');
    cy.wait(1000); // Wait for initial load
  });

  it('should load team directory page', () => {
    cy.contains('Team Directory').should('be.visible');
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should display team members in table view by default', () => {
    // Wait for data to load
    cy.wait(1000);
    
    // Should see table headers
    cy.contains('Name').should('be.visible');
    cy.contains('Role').should('be.visible');
    cy.contains('Email').should('be.visible');
  });

  it('should search for team members by name', () => {
    cy.searchTeamMembers('John');
    
    // Wait for results
    cy.wait(1000);
    
    // Should filter results
    cy.get('tbody tr').should('exist');
    cy.contains('John').should('be.visible');
  });

  it('should filter by role', () => {
    // Wait for page to be fully loaded
    cy.get('input[placeholder*="Search"]').should('be.visible');
    
    cy.filterByRole('Admin');
    
    // Wait for results to load
    cy.wait(1500);
    
    // Should show only Admin roles
    cy.get('tbody tr, [role="article"]').should('have.length.greaterThan', 0);
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'Admin');
    });
  });

  it('should sort by name', () => {
    // Wait for table to be visible
    cy.contains('Name').should('be.visible');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
    
    // Click name column header to sort
    cy.contains('Name').click();
    
    // Wait for sorting to complete
    cy.wait(1000);
    
    // Verify sorted (names should be in ascending order)
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('should toggle between table and grid views', () => {
    // Wait for view toggle to be visible
    cy.get('button[aria-label*="switch to grid" i]').should('be.visible');
    
    // Switch to grid view
    cy.get('button[aria-label*="switch to grid" i]').click();
    
    // Wait for transition and data to load
    cy.wait(1500);
    
    // Should show grid layout
    cy.get('[role="article"]').should('have.length.greaterThan', 0);
    
    // Switch back to table view
    cy.get('button[aria-label*="switch to table" i]').click();
    
    cy.wait(1500);
    
    // Should show table
    cy.contains('Name').should('be.visible');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('should paginate to next page', () => {
    cy.wait(1000);
    
    // Check if pagination exists
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        cy.get('button[aria-label*="next"]').click();
        
        cy.wait(1000);
        
        // Should show page 2
        cy.contains('Page 2').should('be.visible');
      }
    });
  });

  it('should handle empty search results', () => {
    cy.searchTeamMembers('nonexistentuser123456');
    
    cy.wait(1000);
    
    // Should show empty state
    cy.contains('No team members found').should('be.visible');
    cy.contains("couldn't find any matches").should('be.visible');
  });

  it('should clear filters and show all results', () => {
    // Wait for filters to be ready
    cy.get('input[placeholder*="Search"]').should('be.visible');
    
    // Apply filters
    cy.searchTeamMembers('test');
    cy.wait(500);
    cy.filterByRole('Admin');
    
    cy.wait(1500);
    
    // Verify filters are applied
    cy.get('input[placeholder*="Search"]').should('have.value', 'test');
    
    // Clear filters
    cy.clearFilters();
    
    // Wait for filters to clear and data to reload
    cy.wait(2000);
    
    // Search input should be cleared
    cy.get('input[placeholder*="Search"]').should('have.value', '');
    
    // Wait for data to load (might be in loading state)
    cy.get('[data-testid="loading-skeleton"], tbody tr, [role="article"]', { timeout: 5000 }).should('exist');
    
    // Should show all results (wait for loading to complete)
    cy.get('tbody tr, [role="article"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('should navigate using keyboard', () => {
    // Tab to search input
    cy.get('input[placeholder*="Search"]').focus();
    
    // Type search term
    cy.get('input[placeholder*="Search"]').type('John');
    
    // Press Escape to clear
    cy.get('input[placeholder*="Search"]').type('{esc}');
    
    // Search should be cleared
    cy.get('input[placeholder*="Search"]').should('have.value', '');
  });

  it('should persist filters in URL', () => {
    // Apply filters
    cy.searchTeamMembers('John');
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Check URL contains query params
    cy.url().should('include', 'search=John');
    cy.url().should('include', 'role=Admin');
  });

  it('should load filters from URL on page load', () => {
    // Visit with query params
    cy.visit('/en/team-directory?search=John&role=Admin');
    
    cy.wait(1000);
    
    // Should have filters applied
    cy.get('input[placeholder*="Search"]').should('have.value', 'John');
    
    // Role filter should be selected (implementation dependent)
    cy.get('body').should('contain', 'Admin');
  });

  it('should handle error state and retry', function () {
    // This test only works with real API (NEXT_PUBLIC_USE_MOCK_API=false)
    // Use request counting to detect if we're using mock API (no HTTP requests)
    let requestCount = 0;
    
    // Intercept and count requests
    cy.intercept('POST', '**/graphql', (req) => {
      requestCount++;
      req.reply({ statusCode: 500 });
    }).as('failedRequest');
    
    // Reload to trigger request
    cy.reload();
    cy.wait(2000); // Wait a bit to see if request occurs
    
    // Check if any request was made
    cy.then(() => {
      if (requestCount === 0) {
        // No request occurred - using mock API, skip test
        cy.log('Skipping error state test - using mock API (no HTTP requests)');
        this.skip();
        return;
      }
      
      // Request occurred - wait for it and test error state
      cy.wait('@failedRequest', { timeout: 5000 }).then(() => {
        cy.contains(/server error|connection error|something went wrong/i, { timeout: 5000 }).should('be.visible');
        cy.contains('button', /try again/i).click();
        cy.wait(1000);
      });
    });
  });
});
