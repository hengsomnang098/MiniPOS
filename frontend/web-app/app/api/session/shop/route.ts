import { auth } from "@/app/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shopId } = await req.json();
  if (!shopId) return NextResponse.json({ error: "Missing shopId" }, { status: 400 });

  const cookieStore = cookies();
  (await cookieStore).set("activeShopId", shopId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ success: true, shopId });
}
