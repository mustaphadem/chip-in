describe('Get Users API', () => {
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
      url: '/api/users',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.error).to.eq('Unauthorized')
    })
  })

  it('should return list of users', () => {
    cy.api({
      method: 'GET',
      url: '/api/users',
      headers: {
        'x-test-auth': "true",
        'x-auth-id': user.id
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.be.an('array')
    })
  })
})
