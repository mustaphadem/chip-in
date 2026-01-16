import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateParams } from "@/lib/validation";
import { uuidParamSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/authHelpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const prms = await params;
  const validation = validateParams(prms, uuidParamSchema);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid party ID" }, { status: 400 });
  }

  try {
    // Check if party exists
    const party = await prisma.parties.findUnique({
      where: { id: validation.data.id },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.party_members.findUnique({
      where: {
        user_id_party_id: {
          user_id: authResult.session.user.id,
          party_id: validation.data.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Already a member of this party" }, { status: 400 });
    }

    const partyMember = await prisma.party_members.create({
      data: {
        user_id: authResult.session.user.id,
        party_id: validation.data.id,
      },
    });

    return NextResponse.json(partyMember, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed joining party" }, { status: 500 });
  }
}
