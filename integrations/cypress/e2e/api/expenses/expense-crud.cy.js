describe('Expense API - Full CRUD Flow', () => {
  let user = {}
  let party = {}
  let expense = {}

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser
      return cy.createParty(user.id)
    }).then((createdParty) => {
      party = createdParty
    })
  })

  after(() => {
    if (party.id) {
      cy.deleteParty(party)
    }
    if (user.id) {
      cy.deleteUser(user.id)
    }
  })

  it('should create a new expense', () => {
    const expenseData = {
      payer_id: user.id,
      amount: 50.25,
      reason: 'Dinner at restaurant',
    }
    expense.createdAt = new Date().toISOString()

    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: expenseData,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.id).to.not.be.null
      expect(response.body.payer_id).to.eq(user.id)
      expect(response.body.party_id).to.eq(party.id)
      expect(parseFloat(response.body.amount)).to.eq(expenseData.amount)
      expect(response.body.reason).to.eq(expenseData.reason)
      expect(new Date(response.body.created_at)).to.be.greaterThan(new Date(expense.createdAt))

      expense.id = response.body.id
      expense.payer_id = response.body.payer_id
      expense.party_id = response.body.party_id
      expense.amount = response.body.amount
      expense.reason = response.body.reason
      expense.serverCreatedAt = response.body.created_at
    })
  })

  it('should get all expenses for the party', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${party.id}/expenses`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
      expect(response.body.length).to.be.at.least(1)

      const foundExpense = response.body.find(e => e.id === expense.id)
      expect(foundExpense).to.not.be.undefined
      expect(foundExpense.payer_id).to.eq(expense.payer_id)
      expect(foundExpense.party_id).to.eq(expense.party_id)
    })
  })

  it('should get a single expense by id', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(expense.id)
      expect(response.body.payer_id).to.eq(expense.payer_id)
      expect(response.body.party_id).to.eq(expense.party_id)
      expect(response.body.amount).to.eq(expense.amount)
      expect(response.body.reason).to.eq(expense.reason)
    })
  })

  it('should patch the expense', () => {
    const updatedExpense = {
      amount: 75.50,
      reason: 'Updated: Dinner and drinks',
    }

    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      body: updatedExpense,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(expense.id)
      expect(parseFloat(response.body.amount)).to.eq(updatedExpense.amount)
      expect(response.body.reason).to.eq(updatedExpense.reason)
      expect(response.body.payer_id).to.eq(expense.payer_id)
      expect(response.body.party_id).to.eq(expense.party_id)

      expense.amount = response.body.amount
      expense.reason = response.body.reason
    })
  })

  it('should get the patched expense', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(expense.id)
      expect(response.body.amount).to.eq(expense.amount)
      expect(response.body.reason).to.eq(expense.reason)
    })
  })

  it('should delete the expense', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${party.id}/expenses/${expense.id}`,
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(204)
    })
  })

  it('should return 404 when getting deleted expense', () => {
    cy.api({
      method: 'GET',
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
