describe('Expense API - POST Edge Cases', () => {
  let user = {}
  let otherUser = {}
  let party = {}

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
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        amount: 50,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 400 with invalid party ID', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties/invalid-uuid/expenses',
      body: {
        payer_id: user.id,
        amount: 50,
      },
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
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: otherUser.id,
        amount: 50,
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': otherUser.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403)
    })
  })

  it('should return 400 when creating expense without payer_id', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        amount: 50,
        reason: 'Test expense',
      },
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

  it('should return 400 when creating expense without amount', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        reason: 'Test expense',
      },
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

  it('should return 400 when creating expense with invalid payer_id format', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: 'invalid-uuid',
        amount: 50,
      },
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

  it('should return 400 when creating expense with negative amount', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        amount: -50,
      },
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

  it('should return 400 when creating expense with zero amount', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        amount: 0,
      },
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

  it('should return 400 when creating expense with empty body', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {},
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

  it('should return 400 when payer does not exist', () => {
    const nonExistentUserId = crypto.randomUUID()
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: nonExistentUserId,
        amount: 50,
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Payer does not exist')
    })
  })

  it('should return 400 when payer is not a party member', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: otherUser.id,
        amount: 50,
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Payer does not belong to the party')
    })
  })

  it('should create expense with string amount', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        amount: '25.50',
        reason: 'String amount test',
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(parseFloat(response.body.amount)).to.eq(25.50)

      // Clean up
      cy.api({
        method: 'DELETE',
        url: `/api/parties/${party.id}/expenses/${response.body.id}`,
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
        failOnStatusCode: false,
      })
    })
  })

  it('should create expense without reason (optional field)', () => {
    cy.api({
      method: 'POST',
      url: `/api/parties/${party.id}/expenses`,
      body: {
        payer_id: user.id,
        amount: 30,
      },
      headers: {
        'x-test-auth': 'true',
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.payer_id).to.eq(user.id)
      expect(parseFloat(response.body.amount)).to.eq(30)

      // Clean up
      cy.api({
        method: 'DELETE',
        url: `/api/parties/${party.id}/expenses/${response.body.id}`,
        headers: {
          'x-test-auth': 'true',
          'x-auth-id': user.id
        },
        failOnStatusCode: false,
      })
    })
  })
})
