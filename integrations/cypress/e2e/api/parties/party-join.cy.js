describe("Party API - /id/join Tests", () => {
    let user = {};
    let partyOwner = {};
    let party = {};

    before(() => {
        cy.createUser().then((createdPartyOwner) => {
            partyOwner = createdPartyOwner;
            cy.createParty(partyOwner.id).then((createdParty) => {
                party = createdParty;
            })
        });

        cy.createUser().then((createdUser) => {
            user = createdUser;
        });
    })

    after(() => {
        if (user.id) {
            cy.deleteUser(user.id)
        }
        if(party.id) {
            cy.deleteParty(party);
        }
        if(partyOwner.id) {
            cy.deleteUser(partyOwner.id);
        }
    })

    it("should be able to join party", () => {
        user.joinedAt = new Date().toISOString();
        cy.api({
            method: 'POST',
            url: `/api/parties/${party.id}/join`,
            headers: {
                'x-test-auth': 'true',
                'x-auth-id': user.id
            },
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.id).to.not.be.null;
            expect(response.body.user_id).to.eq(user.id);
            expect(response.body.party_id).to.eq(party.id);
            expect(new Date(response.body.joined_at)).to.be.greaterThan(new Date(user.joinedAt));
            expect(response.body.left_at).to.be.null;           
        })
    });

    it("should not be able to join party if already a member", () => {
        cy.api({
            method: 'POST',
            url: `/api/parties/${party.id}/join`,
            headers: {
                'x-test-auth': 'true',
                'x-auth-id': user.id
            },
            failOnStatusCode: false,
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.error).to.eq("Already a member of this party");          
        })
    });


})