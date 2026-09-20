import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims?.sub)
    .single();

  return (
    <div>
      <p className="eyebrow">Settings</p>
      <h1>Your account</h1>
      <p className="sub">&nbsp;</p>

      <div className="settings-row">
        <span className="k">Name</span>
        <span className="v">{profile?.name}</span>
      </div>
      <div className="settings-row">
        <span className="k">Email</span>
        <span className="v">{claims?.email as string}</span>
      </div>
      <div className="settings-row">
        <span className="k">Current flavour</span>
        <span className="v">{profile?.flavour === "homemaker" ? "Homemaker" : profile?.flavour}</span>
      </div>
      <div className="settings-row">
        <span className="k">Reminder channels</span>
        <span className="v">WhatsApp, SMS (not sending yet)</span>
      </div>

      <p className="reminder-note" style={{ marginTop: 20 }}>
        <code>profiles.reminder_preference</code> already holds a place for WhatsApp/SMS
        opt-in — the toggle just isn&rsquo;t wired to send anything until the deferred
        Reminders phase. See <code>lib/notifications/service.ts</code>.
      </p>

      <form action={signOut} style={{ marginTop: 26 }}>
        <button type="submit" className="btn btn-outline">Sign out</button>
      </form>
    </div>
  );
}
