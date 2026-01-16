- This repo is a mono repo being built with next.js, prisma, postgres.
- Current auth is implemented via google oauth.
- Endpoints implement these with next/auth
- All endpoints expects a x-api-header which lives in .env file


#Testing
- All api tests live within /integrations/cypress/e2e/api directory. 
- Whenever you make any changes to the code, all these tests need to be run and all of them needs to pass.
- Do not make any changes to tests without explicit user permission. If there is a failure, flag it to the user.
- When writing tests:
    - Test needs to be deterministic.
    - Avoid unnecessary duplication.
    - Avoid unnecessary abstraction.
    - Tests should not depend on one another and should be run independently.
    - If you see a conflict in this logic, give the user a heads up earlier in the process.

