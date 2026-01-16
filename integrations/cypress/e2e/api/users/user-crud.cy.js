describe('User API - Full CRUD Flow', () => {
  let user = {}

  it('should create a new user', () => {
    const name = `Test User ${Date.now()}`
    const email = name.split(' ').join('').toLowerCase() + '@chipin.com'
    user.created_at = new Date().toISOString()

    cy.api({
      method: 'POST',
      url: '/api/users',
      body: { name, email },
      headers: {
        'x-test-auth': "true"
      },
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.id).to.not.be.null
      expect(response.body.name).to.eq(name)
      expect(response.body.email).to.eq(email)
      expect(new Date(response.body.created_at)).to.be.greaterThan(new Date(user.created_at))

      user.id = response.body.id
      user.name = response.body.name
      user.email = response.body.email
      user.serverCreatedAt = response.body.createdAt
    })
  })

  it('should get the created user', () => {
    cy.api({
      method: 'GET',
      url: `/api/users/${user.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(user.id)
      expect(response.body.name).to.eq(user.name)
      expect(response.body.email).to.eq(user.email)
      expect(response.body.createdAt).to.eq(user.serverCreatedAt)
    })
  })

  it('should return 404 for nonexistent user', () => {
    const randomUUID = crypto.randomUUID();
    cy.api({
      method: 'GET',
      url: `/api/users/${randomUUID}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.error).to.eq('User not found')
    })
  })

  it('should patch the user and ignore immutable fields', () => {
    const updatedUser = {
      name: `Updated User ${Date.now()}`,
      email: `updated${Date.now()}@chipin.com`,
      id: crypto.randomUUID(),
      createdAt: '2000-01-01T00:00:00.000Z',
    }

    cy.api({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: updatedUser,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(user.id)
      expect(response.body.name).to.eq(updatedUser.name)
      expect(response.body.email).to.eq(updatedUser.email)
      expect(response.body.createdAt).to.eq(user.serverCreatedAt)
      expect(response.body.updatedAt).to.not.be.null

      user.name = response.body.name
      user.email = response.body.email
      user.updatedAt = response.body.updatedAt
    })
  })

  it('should get the patched user', () => {
    cy.api({
      method: 'GET',
      url: `/api/users/${user.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(user.id)
      expect(response.body.name).to.eq(user.name)
      expect(response.body.email).to.eq(user.email)
      expect(response.body.createdAt).to.eq(user.serverCreatedAt)
      expect(response.body.updatedAt).to.eq(user.updatedAt)
    })
  })

  it('should return 400 for invalid email format on patch', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { email: 'invalid-email' },
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

  it('should delete the user', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/users/${user.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
    }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })

  it('should return 404 when deleting already deleted user', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/users/${user.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.error).to.eq('User not found')
    })
  })
})
