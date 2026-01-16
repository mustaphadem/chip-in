describe('Party API - PATCH Edge Cases', () => {
  let user = {}
  let party = {}

  before(() => {
    cy.createUser().then((createdUser) => {
      user = createdUser

      cy.api({
        method: 'POST',
        url: '/api/parties',
        body: {
          name: `Test Party ${Date.now()}`,
          created_by_id: user.id,
        },
        headers: {
          'x-test-auth': "true",
          'x-auth-id': user.id
        }
      }).then((partyResponse) => {
        party.id = partyResponse.body.id
        party.name = partyResponse.body.name
        party.created_by_id = partyResponse.body.created_by_id
        party.serverCreatedAt = partyResponse.body.created_at
      })
    })
  })

  after(() => {
    if (party.id) {
      cy.api({
        method: 'DELETE',
        url: `/api/parties/${party.id}`,
        headers: {
          'x-test-auth': "true",
          'x-auth-id': user.id
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(204);
      })
    }
    if (user.id) {
      cy.deleteUser(user.id)
    }
  })

  it('should return 401 without auth', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${crypto.randomUUID()}`,
      body: { name: 'Updated Name' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 404 when patching nonexistent party', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${crypto.randomUUID()}`,
      body: { name: 'Test' },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body.error).to.eq('Party not found')
    })
  })

  it('should return 400 for invalid UUID format', () => {
    cy.api({
      method: 'PATCH',
      url: '/api/parties/invalid-uuid',
      body: { name: 'Test' },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body.error).to.eq('Invalid party ID')
    })
  })

  it('should return 400 for empty name', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}`,
      body: { name: '' },
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

  it('should ignore immutable field: id', () => {
    const fakeId = crypto.randomUUID()

    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}`,
      body: {
        name: `Ignore ID Test ${Date.now()}`,
        id: fakeId,
      },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.id).to.eq(party.id)
    })
  })

  it('should ignore immutable field: created_by_id', () => {
    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}`,
      body: {
        name: `Ignore CreatedById Test ${Date.now()}`,
        created_by_dd: crypto.randomUUID(),
      },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.created_by_id).to.eq(party.created_by_id)
    })
  })

  it('should ignore immutable field: created_at', () => {
    const fakeDate = '2000-01-01T00:00:00.000Z'

    cy.api({
      method: 'PATCH',
      url: `/api/parties/${party.id}`,
      body: {
        name: `Ignore CreatedAt Test ${Date.now()}`,
        created_at: fakeDate,
      },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.created_at).to.eq(party.serverCreatedAt)
    })
  })
})
