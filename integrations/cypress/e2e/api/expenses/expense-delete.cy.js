describe('Expense API - DELETE Edge Cases', () => {
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
      // Add otherUser to the party for authorization tests
      return cy.api({
        method: 'POST',
        url: '/api/parties/join',
        //body: { party_id: party.id },
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': otherUser.id
        },
        failOnStatusCode: false,
      })
    })
  })

  beforeEach(() => {
    // Create a fresh expense for each test()
    cy.createExpense(party.id, user.id, {amount: 100, reason: "Test expense for DELETE"}).then((response) => {
        expense = response;
    });
  });

  afterEach(() => {
    cy.deleteExpense(party.id, expense.id, user.id);
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
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 400 with invalid party ID', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/invalid-uuid/expenses/${expense.id}`,
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
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/invalid-uuid`,
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
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${nonExistentExpenseId}`,
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

  it('should return 403 when non-payer tries to delete expense', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
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

  it('should successfully delete expense and return 204', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(204)

      // Verify expense is deleted
      cy.api({
        method: 'GET',
        url: `/api/parties/${party.id}/expenses/${expense.id}`,
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
        failOnStatusCode: false,
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(404)
      })
    })
  })

  it('should return 404 when deleting already deleted expense', () => {
    // First delete
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then(() => {
      // Second delete attempt
      cy.api({
        method: 'DELETE',
        url: `/api/parties/${party.id}/expenses/${expense.id}`,
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
  })
})
