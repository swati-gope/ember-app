import Link from "next/link";

const FLAVOURS = [
  { name: "Homemaker", desc: "Chores, meal planning, groceries — the household, handled.", ready: true },
  { name: "Working Professional", desc: "Weekly, monthly and quarterly goals.", ready: false },
  { name: "Student", desc: "Study sessions, subjects, deadlines.", ready: false },
  { name: "Fitness", desc: "Workouts, meals, progress.", ready: false },
  { name: "Reflection & Therapy", desc: "Affirmations and descriptive writing.", ready: false },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="nav-row">
        <Link href="/" className="brand">
          Ember<span className="dot">.</span>
        </Link>
        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Get started</Link>
        </div>
      </div>

      <div className="hero">
        <p className="hero-eyebrow">A daily companion, shaped around your life</p>
        <h1>One place for the lists, plans and quiet check-ins that keep your days running.</h1>
        <p>
          To-do lists, habit trackers, affirmations, weekly and monthly planning, and a
          calendar with reminders — all tailored to the shape of your day, not a generic
          template.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary">Get started free</Link>
          <Link href="/login" className="btn btn-outline">I already have an account</Link>
        </div>
      </div>

      <p className="section-label">Choose your flavour</p>
      <h2 className="section-title">Built differently depending on what your days actually look like.</h2>
      <div className="flavour-grid">
        {FLAVOURS.map((f) => (
          <div key={f.name} className={`flavour-card ${f.ready ? "active" : ""}`}>
            <span className={`badge ${f.ready ? "ready" : ""}`}>
              {f.ready ? "Available now" : "Coming soon"}
            </span>
            <h3>{f.name}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="section-label">What&rsquo;s inside</p>
      <div className="feature-row">
        <div className="feature">
          <h4>Daily to-dos</h4>
          <p>Simple lists that reset each day, plus recurring trackers for the things you do on repeat.</p>
        </div>
        <div className="feature">
          <h4>Affirmations</h4>
          <p>A rotating daily affirmation, and space to write your own reflections.</p>
        </div>
        <div className="feature">
          <h4>Weekly &amp; monthly planning</h4>
          <p>Zoom out from today to plan meals, goals or study time across the week.</p>
        </div>
        <div className="feature">
          <h4>Calendar &amp; reminders</h4>
          <p>Mark important dates and get reminded on WhatsApp or SMS.</p>
        </div>
      </div>
    </div>
  );
}
