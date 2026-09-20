import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand">
          Ember<span className="dot">.</span>
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>

        {params.message && <p className="notice">{params.message}</p>}
        {params.error && <p className="error">{params.error}</p>}

        <form action={signIn}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Your password" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign in
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link href="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
