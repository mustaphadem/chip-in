import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateParams, validateBody } from "@/lib/validation";
import { updateUserSchema, uuidParamSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/authHelpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const prms = await params;
  const validation = validateParams(prms, uuidParamSchema);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: validation.data.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed fetching user" }, { status: 500 });
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
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  // Users can only delete themselves
  if (authResult.session.user.id !== validation.data.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: validation.data.id },
    });
    if (!user || user.deleted_at) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const deletedUser = await prisma.users.update({
      where: { id: validation.data.id },
      data: {
        deleted_at: new Date().toISOString(),
      },
    });
    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed deleting user" }, { status: 500 });
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
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  // Users can only update themselves
  if (authResult.session.user.id !== validation.data.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const bodyValidation = await validateBody(request, updateUserSchema);

  if (!bodyValidation.success) {
    return bodyValidation.response;
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: validation.data.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.users.update({
      where: { id: validation.data.id },
      data: {
        ...bodyValidation.data,
        updated_at: new Date().toISOString()
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed updating user" }, { status: 500 });
  }
}
