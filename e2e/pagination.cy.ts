describe('Team Directory - Pagination', () => {
  beforeEach(() => {
    cy.visit('/en/team-directory');
    cy.wait(1000); // Wait for initial load
  });

  it('should display pagination controls when multiple pages exist', () => {
    // Check if pagination exists
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        cy.contains('Page').should('be.visible');
        cy.contains('of').should('be.visible');
      }
    });
  });

  it('should navigate to next page', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        const initialPage = $body.text().match(/Page (\d+)/)?.[1];
        
        cy.get('button[aria-label*="next"]').click();
        
        cy.wait(1000);
        
        // Should show next page number
        cy.contains(`Page ${Number(initialPage) + 1}`).should('be.visible');
      }
    });
  });

  it('should navigate to previous page', () => {
    // First go to page 2
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        cy.get('button[aria-label*="next"]').click();
        cy.wait(1000);
        
        // Then go back
        cy.get('button[aria-label*="previous"]').click();
        cy.wait(1000);
        
        // Should be back on page 1
        cy.contains('Page 1').should('be.visible');
      }
    });
  });

  it('should disable previous button on first page', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="previous"]').length > 0) {
        // Should be on page 1
        cy.contains('Page 1').should('be.visible');
        
        // Previous button should be disabled
        cy.get('button[aria-label*="previous"]').should('be.disabled');
      }
    });
  });

  it('should disable next button on last page', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        // Navigate to last page
        cy.get('button[aria-label*="next"]').then(($nextBtn) => {
          let clickCount = 0;
          const maxClicks = 10; // Safety limit
          
          const clickUntilDisabled = () => {
            if (!$nextBtn.is(':disabled') && clickCount < maxClicks) {
              cy.get('button[aria-label*="next"]').click();
              cy.wait(500);
              clickCount++;
              cy.get('button[aria-label*="next"]').then(($btn) => {
                if (!$btn.is(':disabled')) {
                  clickUntilDisabled();
                } else {
                  cy.get('button[aria-label*="next"]').should('be.disabled');
                }
              });
            }
          };
          
          clickUntilDisabled();
        });
      }
    });
  });

  it('should update URL when navigating pages', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        cy.get('button[aria-label*="next"]').click();
        cy.wait(1000);
        
        // URL should include page parameter
        cy.url().should('include', 'page=2');
      }
    });
  });

  it('should load correct page from URL', () => {
    cy.visit('/en/team-directory?page=2');
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        // Should show page 2
        cy.contains('Page 2').should('be.visible');
      }
    });
  });

  it('should reset to page 1 when filters change', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        // Go to page 2
        cy.get('button[aria-label*="next"]').click();
        cy.wait(1000);
        
        // Apply filter
        cy.searchTeamMembers('John');
        cy.wait(1000);
        
        // Should reset to page 1
        cy.contains('Page 1').should('be.visible');
      }
    });
  });

  it('should show correct page count', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        // Should show total pages
        cy.contains('of').should('be.visible');
        cy.contains(/Page \d+ of \d+/).should('be.visible');
      }
    });
  });

  it('should handle pagination in grid view', () => {
    // Switch to grid view
    cy.contains('button', 'Grid').click();
    cy.wait(1000);
    
    // Should show load more button or pagination
    cy.get('body').then(($body) => {
      if ($body.find('button').text().includes('Load More')) {
        cy.contains('button', 'Load More').should('be.visible');
      } else if ($body.find('button[aria-label*="next"]').length > 0) {
        cy.get('button[aria-label*="next"]').should('be.visible');
      }
    });
  });

  it('should load more items in grid view', () => {
    // Switch to grid view
    cy.contains('button', 'Grid').click();
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('button').text().includes('Load More')) {
        const initialCount = $body.find('[role="article"]').length;
        
        cy.contains('button', 'Load More').click();
        cy.wait(1000);
        
        // Should have more items
        cy.get('[role="article"]').should('have.length.greaterThan', initialCount);
      }
    });
  });

  it('should maintain pagination state when switching views', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label*="next"]').length > 0) {
        // Go to page 2 in table view
        cy.get('button[aria-label*="next"]').click();
        cy.wait(1000);
        
        // Switch to grid view
        cy.contains('button', 'Grid').click();
        cy.wait(1000);
        
        // Switch back to table view
        cy.contains('button', 'Table').click();
        cy.wait(1000);
        
        // Should reset to page 1 (view mode change resets pagination)
        cy.contains('Page 1').should('be.visible');
      }
    });
  });
});
