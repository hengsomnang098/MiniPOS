import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/auth";
import { sidebarGroups } from "@/app/config/adminacl";

const routePermissions: Record<string, string[]> = Object.fromEntries(
  sidebarGroups.flatMap((group) => group.items.map((item) => [item.href, [item.permission]]))
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.warn("⚠️ Middleware auth() failed:", e);
  }

  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const expiresInStr = session?.user?.expiresIn;
  if (expiresInStr) {
    const expiresAt = new Date(expiresInStr).getTime();
    const now = Date.now();

    if (now > expiresAt) {
      // Optionally clear cookies
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.cookies.delete("authjs.session-token");
      response.cookies.delete("__Secure-authjs.session-token");
      response.cookies.delete("authjs.callback-url");
      return response;
    }
  }

  const userPermissions = session?.user?.permissions || [];
  const required = routePermissions[pathname];

  if (required) {
    const hasAccess = required.some((perm) => userPermissions.includes(perm));
    if (!hasAccess) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
