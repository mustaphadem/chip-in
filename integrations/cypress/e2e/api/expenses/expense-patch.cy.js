describe('Expense API - PATCH Edge Cases', () => {
  let user = {}
  let otherUser = {}
  let party = {}
  let expense = {}

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser
      return cy.createParty(user.id)
    }).then((createdParty) => {
      party = createdParty
      return cy.createUser()
    }).then((createdOtherUser) => {
      otherUser = createdOtherUser
    })
  })

  beforeEach(() => {
    // Create a fresh expense for each test
    cy.createExpense(party.id, user.id, {amount: 100, reason: "Test expense for PATCH"}).then((response) => {
      expense = response;
    })
  })

  afterEach(() => {
    if (expense.id) {
      cy.deleteExpense(party.id, expense.id, user.id);
    }
  })

  after(() => {
    if (party.id) {
      cy.deleteParty(party)
    }
    if (user.id) {
      cy.deleteUser(user.id)
    }
    if (otherUser.id) {
      cy.deleteUser(otherUser.id)
    }
  })

  it('should return 401 without auth', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { amount: 150 },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 400 with invalid party ID', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/invalid-uuid/expenses/${expense.id}`,
      body: { amount: 150 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Invalid params')
    })
  })

  it('should return 400 with invalid expense ID', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/invalid-uuid`,
      body: { amount: 150 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Invalid params')
    })
  })

  it('should return 404 for non-existent expense', () => {
    const nonExistentExpenseId = crypto.randomUUID()
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${nonExistentExpenseId}`,
      body: { amount: 150 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.error).to.eq('Expense not found')
    })
  })

  it('should return 403 when non-payer tries to update expense', () => {
    // First add otherUser to the party
    cy.api({
      method: 'POST',
      url: '/api/parties/join',
      body: { party_id: party.id },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': otherUser.id
      },
      failOnStatusCode: false,
    }).then(() => {
      cy.api({
        method: 'PATCH',
        url: `/api/parties/${party.id}/expenses/${expense.id}`,
        body: { amount: 150 },
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': otherUser.id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403)
        expect(response.body.error).to.eq('Not authorized')
      })
    })
  })

  it('should return 400 with negative amount', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { amount: -50 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  })

  it('should return 400 with zero amount', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { amount: 0 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  })

  it('should return 400 with invalid payer_id format', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { payer_id: 'invalid-uuid' },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  })

  it('should successfully update only amount', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { amount: 200 },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(parseFloat(response.body.amount)).to.eq(200)
      expect(response.body.reason).to.eq(expense.reason)
      expect(response.body.payer_id).to.eq(expense.payer_id)
    })
  })

  it('should successfully update only reason', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { reason: 'Updated reason' },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.reason).to.eq('Updated reason')
      expect(response.body.amount).to.eq(expense.amount)
    })
  })

  it('should successfully update multiple fields', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: {
        amount: 300,
        reason: 'Multiple field update',
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(parseFloat(response.body.amount)).to.eq(300)
      expect(response.body.reason).to.eq('Multiple field update')
    })
  })

  it('should accept string amount', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: { amount: '150.75' },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(parseFloat(response.body.amount)).to.eq(150.75)
    })
  })

  it('should handle empty body gracefully', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: {},
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(expense.id)
      expect(response.body.amount).to.eq(expense.amount)
      expect(response.body.reason).to.eq(expense.reason)
    })
  })
})
