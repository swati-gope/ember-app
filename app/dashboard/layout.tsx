import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { DashboardNavLinks } from "@/components/DashboardNav";

// Protected layout: every route under /dashboard passes through here
// first. getClaims() verifies the token — never swap this for
// getSession(), which trusts the cookie without checking it.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  if (!claims) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, flavour")
    .eq("id", claims.sub)
    .single();

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          Ember<span className="dot">.</span>
        </Link>
        <div className="side-greet">
          Hi <strong>{profile?.name || "there"}</strong>
          <br />
          {profile?.flavour === "homemaker" ? "Homemaker" : profile?.flavour} plan
        </div>
        <nav>
          <DashboardNavLinks />
        </nav>
        <div className="sidebar-foot">
          <form action={signOut}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>

      <div className="mobile-topbar">
        <Link href="/dashboard" className="brand">
          Ember<span className="dot">.</span>
        </Link>
      </div>
      <div className="mobile-tabs">
        <DashboardNavLinks />
      </div>

      <main className="main">
        <div className="page-card">{children}</div>
      </main>
    </div>
  );
}
