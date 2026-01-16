import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateBody } from "@/lib/validation";
import { createPartySchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/authHelpers";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const validation = await validateBody(request, createPartySchema);

  if (!validation.success) {
    return validation.response;
  }

  // Use the authenticated user's ID as the creator
  if (validation.data.created_by_id !== authResult.session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const party = await prisma.parties.create({ data: validation.data });
    //Creator is immediately added as a member to the party
    const party_member_data = {
      user_id: validation.data.created_by_id,
      party_id: party.id
    };
    await prisma.party_members.create({ data: party_member_data });
    return NextResponse.json(party, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed creating party" }, { status: 500 });
  }
}
