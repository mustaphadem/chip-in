import prisma from "@/lib/prisma";

export async function findOrCreateUser(
  email: string,
  name?: string | null
) {
  if (!email) throw new Error("Email is required for findOrCreateUser");

  let user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.users.create({
      data: {
        email,
        name: name ?? null,
      },
    });
  }

  return user;
}
