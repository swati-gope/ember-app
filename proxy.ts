import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// NOTE: Next.js 16 renamed middleware.ts to proxy.ts (and the exported
// function from `middleware` to `proxy`). If your project is on Next.js
// 15 or earlier, rename this file to middleware.ts and the function
// below to `export async function middleware(...)` — the Supabase logic
// itself is identical either way.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
