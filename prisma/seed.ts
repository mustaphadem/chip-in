import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
    const user_data = [
        {
            name: "Brian May",
            email: "brian.may@chip.in"
        },
        {
            name: "Freddie Mercury",
            email: "freddie.mercury@chip.in"
        },
        {
            name: "Roger Taylor",
            email: "roger.taylor@chip.in"
        },
        {
            name: "John Deacon",
            email: "john.deacon@chip.in"
        }
    ]

    const users = [];
    
    for (const user of user_data) {
        const usr = await prisma.users.create({
            data: {
                email: user.email,
                name: user.name,
            },
        });

        users.push(usr);
    };
  
  const party = await prisma.parties.create({
    data: {
      name: "Weekend Trip",
      created_by_id: users[0].id
    },
  });

  await prisma.party_members.createMany({
    data: [
      { user_id: users[0].id, party_id: party.id },
      { user_id: users[1].id, party_id: party.id },
      { user_id: users[2].id, party_id: party.id },
    ],
    skipDuplicates: true,
  });

  await prisma.expenses.createMany({
    data: [
      {
        party_id: party.id,
        payer_id: users[0].id,
        amount: 60,
        reason: "Groceries",
      },
      {
        party_id: party.id,
        payer_id: users[0].id,
        amount: 90,
        reason: "Dinner",
      },
      {
        party_id: party.id,
        payer_id: users[1].id,
        amount: 30,
        reason: "Gas",
      },
    ],
  });

  console.log("Seed data created ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
