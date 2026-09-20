import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Called on every request (see the matcher in proxy.ts at the project
// root). Its job: refresh the Auth token before it expires and pass the
// refreshed token to both the server and the browser. Skipping this is
// what causes users to get silently signed out.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verifies the token's signature — never trust getSession() here.
  // getClaims() returns { data: null, error } when there's no session
  // at all (e.g. a signed-out visitor's very first request), so data
  // itself has to be null-checked before pulling claims out of it.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  // Route protection lives here once you're ready for it, e.g.:
  // if (!claims && request.nextUrl.pathname.startsWith("/dashboard")) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  return supabaseResponse;
}
