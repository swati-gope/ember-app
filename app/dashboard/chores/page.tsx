import { createClient } from "@/lib/supabase/server";
import { todayStr, addDays, getMonday, weekDates } from "@/lib/dates";
import { toggleChoreToday, toggleChoreThisWeek } from "./actions";

export default async function ChoresPage() {
  const supabase = await createClient();

  const { data: chores } = await supabase
    .from("chores")
    .select("*")
    .order("created_at");

  const today = todayStr();
  const week = weekDates(getMonday(today));
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const { data: completions } = await supabase
    .from("chore_completions")
    .select("chore_id, done_date")
    .gte("done_date", last7[0]);

  const daily = (chores ?? []).filter((c) => c.freq === "daily");
  const weekly = (chores ?? []).filter((c) => c.freq === "weekly");

  const doneToday = (choreId: string) =>
    !!completions?.some((c) => c.chore_id === choreId && c.done_date === today);
  const doneThisWeek = (choreId: string) =>
    !!completions?.some((c) => c.chore_id === choreId && week.includes(c.done_date));
  const history = (choreId: string) =>
    last7.map((d) => !!completions?.some((c) => c.chore_id === choreId && c.done_date === d));

  return (
    <div>
      <h1>Chores</h1>
      <p className="sub">
        Daily chores reset each morning; weekly ones just need doing once a week.
      </p>

      {(!chores || chores.length === 0) && (
        <p className="empty-state">
          No chores yet — run <code>supabase/migrations/0002_seed_default_chores.sql</code>{" "}
          for new sign-ups to get a starter list, or add rows to the{" "}
          <code>chores</code> table for this user directly.
        </p>
      )}

      <section className="chore-section">
        <h2>Daily</h2>
        {daily.map((c) => (
          <div className="chore-row" key={c.id}>
            <form action={toggleChoreToday.bind(null, c.id)}>
              <button
                type="submit"
                className={`checkbox ${doneToday(c.id) ? "on" : ""}`}
                aria-label={`Mark ${c.name} done for today`}
              >
                {doneToday(c.id) ? "✓" : ""}
              </button>
            </form>
            <span className={`item-text ${doneToday(c.id) ? "done" : ""}`}>{c.name}</span>
            <span className="chore-history">
              {history(c.id).map((f, i) => (
                <span key={i} className={`hist-dot ${f ? "filled" : ""}`} />
              ))}
            </span>
          </div>
        ))}
      </section>

      <section className="chore-section">
        <h2>Weekly</h2>
        {weekly.map((c) => (
          <div className="chore-row" key={c.id}>
            <form action={toggleChoreThisWeek.bind(null, c.id)}>
              <button
                type="submit"
                className={`checkbox ${doneThisWeek(c.id) ? "on" : ""}`}
                aria-label={`Mark ${c.name} done for the week`}
              >
                {doneThisWeek(c.id) ? "✓" : ""}
              </button>
            </form>
            <span className={`item-text ${doneThisWeek(c.id) ? "done" : ""}`}>{c.name}</span>
            <span className="chore-history">
              {history(c.id).map((f, i) => (
                <span key={i} className={`hist-dot ${f ? "filled" : ""}`} />
              ))}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
