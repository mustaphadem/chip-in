describe('Health API', () => {
  it('should return status OK', () => {
    cy.api('GET', '/api/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.deep.eq({ status: 'OK' })
    })
  })
})
