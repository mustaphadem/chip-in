describe('Expense API - GET Edge Cases', () => {
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
      // Create an expense for testing
      return cy.api({
        method: 'POST',
        url: `/api/parties/${party.id}/expenses`,
        body: {
          payer_id: user.id,
          amount: 100,
          reason: 'Test expense for GET',
        },
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
      })
    }).then((response) => {
      expense = response.body
    })
  })

  after(() => {
    if (expense.id) {
      cy.deleteExpense(party.id, expense.id, user.id);
    }
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

  describe('GET /api/parties/:id/expenses', () => {
    it('should return 401 without auth', () => {
      cy.api({
        method: 'GET',
        url: `/api/parties/${party.id}/expenses`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body.error).to.eq('Unauthorized')
      })
    })

    it('should return 400 with invalid party ID', () => {
      cy.api({
        method: 'GET',
        url: '/api/parties/invalid-uuid/expenses',
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.error).to.eq('Invalid party ID')
      })
    })

    it('should return 403 when user is not a party member', () => {
      cy.api({
        method: 'GET',
        url: `/api/parties/${party.id}/expenses`,
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': otherUser.id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403)
      })
    })

    it('should return empty array for party with no expenses', () => {
      // Create a new party with no expenses
      cy.createParty(user.id, { name: 'Empty Party' }).then((emptyParty) => {
        cy.api({
          method: 'GET',
          url: `/api/parties/${emptyParty.id}/expenses`,
          headers: {
            'x-test-auth': 'true',
            'x-auth-id': user.id
          },
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.be.an('array')
          expect(response.body.length).to.eq(0)

          // Clean up
          cy.deleteParty(emptyParty)
        })
      })
    })

    it('should return expenses ordered by created_at desc', () => {
      // Create a second expense
      cy.api({
        method: 'POST',
        url: `/api/parties/${party.id}/expenses`,
        body: {
          payer_id: user.id,
          amount: 200,
          reason: 'Second expense',
        },
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
      }).then((postResponse) => {
        const secondExpense = postResponse.body

        cy.api({
          method: 'GET',
          url: `/api/parties/${party.id}/expenses`,
          headers: {
            'x-test-auth': 'true',
            'x-auth-id': user.id
          },
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.length).to.be.at.least(2)
          // Most recent expense should be first
          expect(response.body[0].id).to.eq(secondExpense.id)

          // Clean up second expense
          cy.api({
            method: 'DELETE',
            url: `/api/parties/${party.id}/expenses/${secondExpense.id}`,
            headers: {
              'x-test-auth': 'true',
              'x-auth-id': user.id
            },
            failOnStatusCode: false,
          })
        })
      })
    })
  })

  describe('GET /api/parties/:id/expenses/:expense_id', () => {
    it('should return 401 without auth', () => {
      cy.api({
        method: 'GET',
        url: `/api/parties/${party.id}/expenses/${expense.id}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401)
        expect(response.body.error).to.eq('Unauthorized')
      })
    })

    it('should return 400 with invalid party ID', () => {
      cy.api({
        method: 'GET',
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
        method: 'GET',
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

    it('should return 403 when user is not a party member', () => {
      cy.api({
        method: 'GET',
        url: `/api/parties/${party.id}/expenses/${expense.id}`,
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': otherUser.id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403)
      })
    })

    it('should return 404 for non-existent expense', () => {
      const nonExistentExpenseId = crypto.randomUUID()
      cy.api({
        method: 'GET',
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
  })
})
