import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/signup", "/auth/callback", "/view"];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith("/view/"),
  );

  const hasSession = request.cookies.getAll().some(
    (c) => c.name.includes("sb-") && c.name.includes("-auth-token"),
  );

  if (!hasSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
