import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateBody, validateParams } from "@/lib/validation";
import { updateExpenseSchema, expenseParamsSchema } from "@/lib/schemas";
import { requireAuth, requirePartyMember } from "@/lib/authHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expense_id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const prms = await params;
  const paramValidation = validateParams(prms, expenseParamsSchema);

  if (!paramValidation.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const memberResult = await requirePartyMember(authResult.session.user.id, paramValidation.data.id);
  if (memberResult.error) return memberResult.error;

  try {
    const expense = await prisma.expenses.findUnique({
      where: { id: paramValidation.data.expense_id },
    });
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed fetching expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expense_id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const prms = await params;
  const paramValidation = validateParams(prms, expenseParamsSchema);

  if (!paramValidation.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const bodyValidation = await validateBody(request, updateExpenseSchema);

  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  try {
    const expense = await prisma.expenses.findUnique({
      where: { id: paramValidation.data.expense_id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Only the payer can update their expense
    if (expense.payer_id !== authResult.session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updatedExpense = await prisma.expenses.update({
      where: { id: paramValidation.data.expense_id },
      data: bodyValidation.data,
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed updating expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expense_id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const prms = await params;
  const paramValidation = validateParams(prms, expenseParamsSchema);

  if (!paramValidation.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  try {
    const expense = await prisma.expenses.findUnique({
      where: { id: paramValidation.data.expense_id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Only the payer can delete their expense
    if (expense.payer_id !== authResult.session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.expenses.delete({
      where: { id: paramValidation.data.expense_id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed deleting expense" },
      { status: 500 }
    );
  }
}
