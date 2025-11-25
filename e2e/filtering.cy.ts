describe('Team Directory - Filtering', () => {
  beforeEach(() => {
    cy.visit('/en/team-directory');
    // Wait for page to be ready and data to load
    cy.get('body').should('be.visible');
    cy.wait(1500); // Wait for initial load and animations
  });

  it('should search by name', () => {
    cy.searchTeamMembers('John');
    
    cy.wait(1000);
    
    // Should show filtered results
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'John');
    });
  });

  it('should search by email', () => {
    cy.searchTeamMembers('@example.com');
    
    cy.wait(1000);
    
    // Should show results with matching emails
    cy.get('tbody tr, [role="article"]').should('exist');
  });

  it('should filter by Admin role', () => {
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Should show only Admin roles
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'Admin');
    });
  });

  it('should filter by Agent role', () => {
    cy.filterByRole('Agent');
    
    cy.wait(1000);
    
    // Should show only Agent roles
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'Agent');
    });
  });

  it('should filter by Creator role', () => {
    cy.filterByRole('Creator');
    
    cy.wait(1000);
    
    // Should show only Creator roles
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'Creator');
    });
  });

  it('should combine search and role filters', () => {
    // Apply both filters
    cy.searchTeamMembers('John');
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Should show results matching both criteria
    cy.get('tbody tr, [role="article"]').each(($row) => {
      cy.wrap($row).should('contain', 'John');
      cy.wrap($row).should('contain', 'Admin');
    });
  });

  it('should clear search filter', () => {
    cy.searchTeamMembers('John');
    
    cy.wait(1000);
    
    // Clear search
    cy.get('input[placeholder*="Search"]').clear();
    
    cy.wait(1000);
    
    // Should show all results
    cy.get('tbody tr, [role="article"]').should('have.length.greaterThan', 0);
  });

  it('should clear role filter', () => {
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Clear role filter using custom command
    cy.clearRoleFilter();
    
    cy.wait(1000);
    
    // Should show all roles
    cy.get('tbody tr, [role="article"]').should('exist');
  });

  it('should clear all filters at once', () => {
    // Apply multiple filters
    cy.searchTeamMembers('John');
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Clear all filters
    cy.clearFilters();
    
    cy.wait(1000);
    
    // Should reset to default state
    cy.get('input[placeholder*="Search"]').should('have.value', '');
    cy.get('tbody tr, [role="article"]').should('have.length.greaterThan', 0);
  });

  it('should show empty state when no results match filters', () => {
    cy.searchTeamMembers('nonexistentuser123456789');
    
    cy.wait(1000);
    
    cy.contains('No team members found').should('be.visible');
    cy.contains("couldn't find any matches").should('be.visible');
  });

  it('should update URL when filters change', () => {
    cy.searchTeamMembers('John');
    
    cy.wait(1000);
    
    cy.url().should('include', 'search=John');
    
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    cy.url().should('include', 'search=John');
    cy.url().should('include', 'role=Admin');
  });

  it('should preserve filters when switching views', () => {
    // Apply filters in table view
    cy.searchTeamMembers('John');
    cy.filterByRole('Admin');
    
    cy.wait(1000);
    
    // Switch to grid view
    cy.contains('button', 'Grid').click();
    
    cy.wait(1000);
    
    // Filters should still be applied
    cy.get('input[placeholder*="Search"]').should('have.value', 'John');
    
    // Switch back to table
    cy.contains('button', 'Table').click();
    
    cy.wait(1000);
    
    // Filters should still be applied
    cy.get('input[placeholder*="Search"]').should('have.value', 'John');
  });

  it('should handle rapid filter changes', () => {
    // Wait for initial load
    cy.get('input[placeholder*="Search"]').should('be.visible');
    cy.wait(1000);
    
    // Rapidly change filters - use selectAll to avoid clear triggering intermediate searches
    cy.get('input[placeholder*="Search"]').type('{selectAll}John');
    cy.wait(100);
    cy.get('input[placeholder*="Search"]').type('{selectAll}Jane');
    cy.wait(100);
    cy.get('input[placeholder*="Search"]').type('{selectAll}Bob');
    
    // Verify the input has the correct value (ensures last change was applied)
    cy.get('input[placeholder*="Search"]').should('have.value', 'Bob');
    
    // Wait for debounce to complete and URL to update
    // This confirms the search was processed (debounce 300ms + URL update buffer)
    cy.url({ timeout: 5000 }).should('include', 'search=Bob');
    
    // After URL updates, wait for API call to complete (500ms) + rendering
    cy.wait(800);
    
    // Should show results for last filter OR empty state
    // Wait for either results to appear or empty state message
    // This handles both cases: results found or no results
    cy.get('body', { timeout: 10000 }).should(($body) => {
      const hasResults = $body.find('tbody tr, [role="article"]').length > 0;
      const hasEmptyState = $body.text().includes('No team members found') || 
                           $body.text().includes("couldn't find any matches");
      expect(hasResults || hasEmptyState).to.be.true;
    });
  });
});
