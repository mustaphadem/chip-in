describe('Party API - POST Edge Cases', () => {
  let user = {}

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser
    })
  });

  after(() => {
    if (user.id) {
      cy.deleteUser(user.id)
    }
  });

  it('should return 401 without auth', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: {
        name: 'Test Party',
        created_by_id: crypto.randomUUID()
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  });

  it('should return 400 when creating party without name', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: { created_by_id: user.id },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  });

  it('should return 400 when creating party without created_by_id', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: { name: 'Test Party' },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  });

  it('should return 400 when creating party with empty name', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: { name: '', created_by_id: user.id },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  });

  it('should return 400 when creating party with invalid created_by_id type', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: { name: 'Test Party', created_by_id: 'invalid' },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  });

  it('should return 400 when creating party with empty body', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: {},
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Validation failed')
    })
  })
});
