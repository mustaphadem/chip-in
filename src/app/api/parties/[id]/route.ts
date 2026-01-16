import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateParams, validateBody } from "@/lib/validation";
import { uuidParamSchema, updatePartySchema } from "@/lib/schemas";
import { requireAuth, requirePartyMember, requirePartyCreator } from "@/lib/authHelpers";

export async function GET(
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

  const memberResult = await requirePartyMember(authResult.session.user.id, validation.data.id);
  if (memberResult.error) return memberResult.error;

  try {
    const party = await prisma.parties.findUnique({
      where: { id: validation.data.id },
    });
    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }
    return NextResponse.json(party);
  } catch (error) {
    return NextResponse.json({ error: "Failed fetching party" }, { status: 500 });
  }
}

export async function PATCH(
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

  const creatorResult = await requirePartyCreator(authResult.session.user.id, validation.data.id);
  if (creatorResult.error) return creatorResult.error;

  const bodyValidation = await validateBody(request, updatePartySchema);

  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  try {
    const updatedParty = await prisma.parties.update({
      where: { id: validation.data.id },
      data: {
        ...creatorResult.party,
        ...bodyValidation.data
      }
    });

    return NextResponse.json(updatedParty);
  } catch (error) {
    return NextResponse.json({ error: "Failed updating party" }, { status: 500 });
  }
}

export async function DELETE(
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

  const creatorResult = await requirePartyCreator(authResult.session.user.id, validation.data.id);
  if (creatorResult.error) return creatorResult.error;

  try {
    await prisma.parties.delete({
      where: { id: validation.data.id },
    });

    return new NextResponse(null, {status: 204});
  } catch (error) {
    return NextResponse.json({ error: "Failed deleting party" }, { status: 500 });
  }
}
