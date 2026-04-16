import { NextResponse } from "next/server";

export async function middleware(request) {
  // Disabling middleware temporarily to unblock Vercel deployment
  // return await updateSession(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
