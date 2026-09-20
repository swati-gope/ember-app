import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          Ember<span className="dot">.</span>
        </div>
        <p className="eyebrow">Homemaker plan</p>
        <h1>Create your account</h1>

        {params.error && <p className="error">{params.error}</p>}

        <form action={signUp}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="At least 6 characters" minLength={6} required />
          </div>
          <div className="field">
            <label htmlFor="flavour">Flavour</label>
            <select id="flavour" name="flavour" defaultValue="homemaker">
              <option value="homemaker">Homemaker</option>
              <option value="professional" disabled>Working Professional (coming soon)</option>
              <option value="student" disabled>Student (coming soon)</option>
              <option value="fitness" disabled>Fitness (coming soon)</option>
              <option value="therapy" disabled>Reflection &amp; Therapy (coming soon)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: 4 }}>
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
