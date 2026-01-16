import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { validateBody } from "@/lib/validation";
import { createUserSchema } from "@/lib/schemas";
import { requireAuth } from "@/lib/authHelpers";

export async function GET(request: NextRequest) {
  
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult.error;

  const users = await prisma.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "production"){
    const useTestAuth = request.headers.get("x-test-auth");
    if(useTestAuth){
      const validation = await validateBody(request, createUserSchema);
      if (!validation.success) {
        return validation.response;
      }
      const user = await prisma.users.create({ data: validation.data });
      return NextResponse.json(user, { status: 201 });
    }
  }
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const validation = await validateBody(request, createUserSchema);

  if (!validation.success) {
    return validation.response;
  }

  try {
    const user = await prisma.users.create({ data: validation.data });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed creating user" }, { status: 500 });
  }
}
