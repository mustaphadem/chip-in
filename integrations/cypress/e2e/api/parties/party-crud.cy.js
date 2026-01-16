describe('Party API - Full CRUD Flow', () => {
  let user = {}
  let party = {}

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser
    })
  })

  after(() => {
    if (user.id) {
      cy.deleteUser(user.id)
    }
  })

  it('should create a new party', () => {
    const partyData = {
      name: `Test Party ${Date.now()}`,
      created_by_id: user.id,
    }
    party.createdAt = new Date().toISOString()

    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: partyData,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(201)
      expect(response.body.id).to.not.be.null
      expect(response.body.name).to.eq(partyData.name)
      expect(response.body.created_by_id).to.eq(user.id)
      expect(new Date(response.body.created_at)).to.be.greaterThan(new Date(party.createdAt))

      party.id = response.body.id
      party.name = response.body.name
      party.created_by_id = response.body.created_by_id
      party.serverCreatedAt = response.body.created_at
    })
  })

  it('should get the created party', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${party.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(party.id)
      expect(response.body.name).to.eq(party.name)
      expect(response.body.created_by_id).to.eq(party.created_by_id)
      expect(response.body.created_at).to.eq(party.serverCreatedAt)
    })
  })

  it('should patch the party and ignore immutable fields', () => {
    const updatedParty = {
      name: `Updated Party ${Date.now()}`,
      id: crypto.randomUUID(),
      created_by_id: crypto.randomUUID(),
      created_at: '2000-01-01T00:00:00.000Z',
    }

    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}`,
      body: updatedParty,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(party.id)
      expect(response.body.name).to.eq(updatedParty.name)
      expect(response.body.created_by_id).to.eq(party.created_by_id)
      expect(response.body.created_at).to.eq(party.serverCreatedAt)

      party.name = response.body.name
    })
  })

  it('should get the patched party', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${party.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(party.id)
      expect(response.body.name).to.eq(party.name)
      expect(response.body.created_by_id).to.eq(party.created_by_id)
      expect(response.body.created_at).to.eq(party.serverCreatedAt)
    })
  })

  it('should delete the party', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${party.id}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(204);
    })
  })
})
