import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateBody, validateParams } from "@/lib/validation";
import { createExpenseSchema, uuidParamSchema } from "@/lib/schemas";
import { requireAuth, requirePartyMember } from "@/lib/authHelpers";

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
    const expenses = await prisma.expenses.findMany({
      where: {
        party_id: validation.data.id,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed fetching expenses for party" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const prms = await params;
  const paramValidation = validateParams(prms, uuidParamSchema);

  if (!paramValidation.success) {
    return NextResponse.json({ error: "Invalid party ID" }, { status: 400 });
  }

  const memberResult = await requirePartyMember(authResult.session.user.id, paramValidation.data.id);
  if (memberResult.error) return memberResult.error;

  const bodyValidation = await validateBody(request, createExpenseSchema);

  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  try {
    const payer = await prisma.users.findUnique({ where: { id: bodyValidation.data.payer_id } });

    if (!payer) {
      return NextResponse.json({ error: "Payer does not exist" }, { status: 400 });
    }

    // Check if payer is a party member
    const payerMemberResult = await requirePartyMember(payer.id, paramValidation.data.id);
    if (payerMemberResult.error) {
      return NextResponse.json({ error: "Payer does not belong to the party" }, { status: 400 });
    }

    const expense = await prisma.expenses.create({
      data: {
        ...bodyValidation.data,
        party_id: paramValidation.data.id,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed creating expense" }, { status: 500 });
  }
}
