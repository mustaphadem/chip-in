describe('Party API - DELETE Edge Cases', () => {
  let user = {}

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

  it('should return 401 without auth', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${crypto.randomUUID()}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 404 when deleting nonexistent party', () => {
    cy.api({
      method: 'DELETE',
      url: `/api/parties/${crypto.randomUUID()}`,
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
      method: 'DELETE',
      url: '/api/parties/invalid-uuid',
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

  it('should return 404 when deleting already deleted party', () => {
    cy.api({
      method: 'POST',
      url: '/api/parties',
      body: {
        name: `Temp Party ${Date.now()}`,
        created_by_id: user.id,
      },
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      const partyId = response.body.id

      cy.api({
        method: 'DELETE',
        url: `/api/parties/${partyId}`,
        headers: {
          'x-test-auth': "true",
          'x-auth-id': user.id
        }
      }).then((deleteResponse) => {
        expect(deleteResponse.status).to.eq(204)

        cy.api({
          method: 'DELETE',
          url: `/api/parties/${partyId}`,
          headers: {
            'x-test-auth': "true",
            'x-auth-id': user.id
          },
          failOnStatusCode: false,
        }).then((secondDeleteResponse) => {
          expect(secondDeleteResponse.status).to.eq(404)
          expect(secondDeleteResponse.body.error).to.eq('Party not found')
        })
      })
    })
  })
})
