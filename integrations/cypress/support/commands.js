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
 * @param {string} userId - The user ID to delete
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

/**
 * Creates a party via the API
 * @param {string} userId - created_by_id
 * @param {Object} options.name - optional party name
 * @returns {Cypress.Chainable}
 */
Cypress.Commands.add('createParty', (userId, options = {}) => {
  const name = options.name || `Test Party ${Date.now()}`;
  const created_by_id = userId;
  return cy.api({
        method: 'POST',
        url: '/api/parties',
        body: {
          "name": name,
          "created_by_id": created_by_id
        },
        headers: {
          'x-test-auth': "true",
          'x-auth-id': userId
        },
        failOnStatusCode: false,
    }).then((response) => {
      return response.body;
    })
})

/**
 * Deletes a party via the API
 * @param {string} party.id - Party ID to delete
 * @param {string} party.created_by_id - Party creator
 * @returns {Cypress.Chainable}
 */
Cypress.Commands.add('deleteParty', (party) => {
  return cy.api({
        method: 'DELETE',
        url: `/api/parties/${party.id}`,
        headers: {
          'x-test-auth': "true",
          'x-auth-id': party.created_by_id
        },
        failOnStatusCode: false
    });
})

/**
 * Creates an expense via the API
 * @param {string} partyId - The party ID to add the expense to
 * @param {string} payerId - The user ID of the payer
 * @param {Object} options - Optional parameters
 * @param {number} options.amount - Expense amount (defaults to 50)
 * @param {string} options.reason - Expense reason (optional)
 * @returns {Cypress.Chainable} - The created expense object
 */
Cypress.Commands.add('createExpense', (partyId, payerId, options = {}) => {
  const amount = options.amount || 50
  const body = {
    payer_id: payerId,
    amount: amount,
  }
  if (options.reason) {
    body.reason = options.reason
  }

  return cy.api({
    method: 'POST',
    url: `/api/parties/${partyId}/expenses`,
    body: body,
    headers: {
      'x-test-auth': 'true',
      'x-auth-id': payerId
    },
  }).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

/**
 * Deletes an expense via the API (silent fail if not found)
 * @param {string} partyId - The party ID
 * @param {string} expenseId - The expense ID to delete
 * @param {string} payerId - The user ID of the payer (only payer can delete)
 * @returns {Cypress.Chainable}
 */
Cypress.Commands.add('deleteExpense', (partyId, expenseId, payerId) => {
  return cy.api({
    method: 'DELETE',
    url: `/api/parties/${partyId}/expenses/${expenseId}`,
    headers: {
      'x-test-auth': 'true',
      'x-auth-id': payerId
    },
    failOnStatusCode: false,
  })
})