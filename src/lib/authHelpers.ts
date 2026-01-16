import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

type AuthResult =
  | { session: { user: { id: string } }; error?: never }
  | { session?: never; error: NextResponse };

type PartyMemberResult =
  | { member: { id: string; user_id: string; party_id: string }; error?: never }
  | { member?: never; error: NextResponse };

type PartyCreatorResult =
  | { party: { id: string; created_by_id: string }; error?: never }
  | { party?: never; error: NextResponse };

export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  // In test/dev, allow bypassing auth with a test user
  if (process.env.NODE_ENV !== "production") {
    const useTestAuth = request.headers.get("x-test-auth");
    if (useTestAuth === "true") {
      const isUsersPost =
        request.nextUrl.pathname === "/api/users" &&
        request.method === "POST";

      if (isUsersPost) {
        // For POST /users, use the payload data to create the test user
        const body = await request.clone().json();
        const testUser = await prisma.users.upsert({
          where: { email: body.email },
          update: { name: body.name },
          create: { email: body.email, name: body.name },
        });
        return { session: { user: { id: testUser.id } } };
      } else {
        // For all other routes, expect x-auth-id header
        const authId = request.headers.get("x-auth-id");
        if (!authId) {
          return {
            error: NextResponse.json(
              { error: "x-auth-id header required for test auth" },
              { status: 401 }
            ),
          };
        }
        const testUser = await prisma.users.upsert({
          where: { id: authId },
          update: {},
          create: { id: authId, email: `test-${authId}@chip.in`, name: "Test User" },
        });
        return { session: { user: { id: testUser.id } } };
      }
    }
  }

  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session: { user: { id: session.user.id } } };
}

export async function requirePartyMember(
  userId: string,
  partyId: string
): Promise<PartyMemberResult> {
  const member = await prisma.party_members.findUnique({
    where: { user_id_party_id: { user_id: userId, party_id: partyId } },
  });
  if (!member) {
    return {
      error: NextResponse.json({ error: "Not a party member" }, { status: 403 }),
    };
  }
  return { member };
}

export async function requirePartyCreator(
  userId: string,
  partyId: string
): Promise<PartyCreatorResult> {
  const party = await prisma.parties.findUnique({ where: { id: partyId } });
  if (!party) {
    return {
      error: NextResponse.json({ error: "Party not found" }, { status: 404 }),
    };
  }
  if (party.created_by_id !== userId) {
    return {
      error: NextResponse.json({ error: "Not authorized" }, { status: 403 }),
    };
  }
  return { party };
}
