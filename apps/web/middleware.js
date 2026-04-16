import { updateSession } from "@/lib/supabase/middleware";

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
