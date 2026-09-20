import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AFFIRMATIONS } from "@/lib/affirmations";
import { dayOfYear, friendlyDateFull, todayStr } from "@/lib/dates";
import { addTodo, toggleTodo } from "./actions";

export default async function TodayPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;
  const today = todayStr();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", claims?.sub)
    .single();

  const { data: todos } = await supabase
    .from("todos")
    .select("*")
    .eq("date", today)
    .order("created_at");

  const { data: dailyChores } = await supabase
    .from("chores")
    .select("id")
    .eq("freq", "daily");

  const { data: choresDoneToday } = await supabase
    .from("chore_completions")
    .select("chore_id")
    .eq("done_date", today);

  const { data: eventsToday } = await supabase
    .from("events")
    .select("*")
    .eq("event_date", today)
    .order("event_time", { ascending: true, nullsFirst: false });

  const idx = dayOfYear(new Date()) % AFFIRMATIONS.length;
  const todoDoneCount = todos?.filter((t) => t.done).length ?? 0;
  const choreDoneCount =
    dailyChores?.filter((c) => choresDoneToday?.some((d) => d.chore_id === c.id)).length ?? 0;

  return (
    <div>
      <p className="eyebrow">{friendlyDateFull(today)}</p>
      <h1>Good to see you, {profile?.name || "there"}.</h1>
      <p className="sub">Here&rsquo;s where today stands.</p>

      <div className="stat-row">
        <div className="stat">
          <div className="num">{todoDoneCount}/{todos?.length ?? 0}</div>
          <div className="lbl">To-dos done</div>
        </div>
        <div className="stat">
          <div className="num">{choreDoneCount}/{dailyChores?.length ?? 0}</div>
          <div className="lbl">Daily chores done</div>
        </div>
        <div className="stat">
          <div className="num">{eventsToday?.length ?? 0}</div>
          <div className="lbl">Events today</div>
        </div>
      </div>

      <div className="affirm-strip">
        <p>&ldquo;{AFFIRMATIONS[idx]}&rdquo;</p>
      </div>

      {eventsToday && eventsToday.length > 0 && (
        <>
          <h2>Today&rsquo;s events</h2>
          {eventsToday.map((e) => (
            <div className="evt-row" key={e.id}>
              <div className="evt-title">{e.title}</div>
              <div className="evt-meta">
                {e.event_time ? e.event_time + " · " : ""}
                {e.reminder_enabled ? `Reminder via ${e.reminder_channel}` : "No reminder"}
              </div>
            </div>
          ))}
          <p className="sub" style={{ margin: "10px 0 0" }}>
            <Link href="/dashboard/calendar">Open calendar →</Link>
          </p>
        </>
      )}

      <h2>Today&rsquo;s to-do list</h2>
      <form action={addTodo} className="todo-add">
        <input name="text" type="text" placeholder="Add something for today…" required />
        <button type="submit" className="btn-add">Add</button>
      </form>

      {(!todos || todos.length === 0) && (
        <p className="empty-state">Nothing on today&rsquo;s list yet — add what&rsquo;s ahead of you.</p>
      )}
      {todos?.map((t) => (
        <div className="chore-row" key={t.id}>
          <form action={toggleTodo.bind(null, t.id, t.done)}>
            <button type="submit" className={`checkbox ${t.done ? "on" : ""}`}>
              {t.done ? "✓" : ""}
            </button>
          </form>
          <span className={`item-text ${t.done ? "done" : ""}`}>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
