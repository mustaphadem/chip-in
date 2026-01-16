// ***********************************************
// Custom Cypress Commands
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Creates a user via the API
 * @param {Object} options - Optional parameters
 * @param {string} options.name - User name (defaults to random)
 * @param {string} options.email - User email (defaults to generated from name)
 * @returns {Cypress.Chainable} - The created user object
 */
Cypress.Commands.add('createUser', (options = {}) => {
  const name = options.name || `Test User ${Date.now()}`
  const email = options.email || name.split(' ').join('').toLowerCase() + '@chipin.com'

  return cy.api({
    method: 'POST',
    url: '/api/users',
    body: { name, email },
    headers: { 
      'x-test-auth': "true"
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
})

/**
 * Deletes a user via the API (silent fail if not found)
 * @param {number} userId - The user ID to delete
 * @returns {Cypress.Chainable}
 */
Cypress.Commands.add('deleteUser', (userId) => {
  return cy.api({
    method: 'DELETE',
    url: `/api/users/${userId}`,
    headers: {
      'x-test-auth': "true",
      'x-auth-id': userId
    },
    failOnStatusCode: false,
  })
})
