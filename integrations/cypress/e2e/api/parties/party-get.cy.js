describe('Party API - GET Edge Cases', () => {
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
      method: 'GET',
      url: `/api/parties/${crypto.randomUUID()}`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return 403 for nonexistent party (user not a member)', () => {
    cy.api({
      method: 'GET',
      url: `/api/parties/${crypto.randomUUID()}`,
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403)
      expect(response.body.error).to.eq('Not a party member')
    })
  })

  it('should return 400 for invalid UUID format', () => {
    cy.api({
      method: 'GET',
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

})
