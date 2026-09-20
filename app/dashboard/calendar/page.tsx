import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { friendlyDateFull, todayStr } from "@/lib/dates";
import { addEvent, deleteEvent } from "./actions";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; day?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const month = params.month ? parseInt(params.month, 10) : now.getMonth(); // 0-indexed
  const selectedDay = params.day ?? todayStr();
  const todayS = todayStr();

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_time", { ascending: true, nullsFirst: false });

  const first = new Date(year, month, 1);
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let prevMonth = month - 1, prevYear = year;
  if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
  let nextMonth = month + 1, nextYear = year;
  if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }

  const hasEvent = (ds: string) => (events ?? []).some((e) => e.event_date === ds);
  const selEvents = (events ?? []).filter((e) => e.event_date === selectedDay);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <h1>Mark what matters, get reminded in time</h1>
      <div className="cal-layout">
        <div>
          <div className="cal-nav">
            <Link href={`/dashboard/calendar?year=${prevYear}&month=${prevMonth}&day=${selectedDay}`}>←</Link>
            <span className="lbl">{MONTHS[month]} {year}</span>
            <Link href={`/dashboard/calendar?year=${nextYear}&month=${nextMonth}&day=${selectedDay}`}>→</Link>
          </div>
          <div className="cal-grid">
            {DOW.map((d) => (
              <div className="cal-dow" key={d}>{d}</div>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <div className="cal-day other" key={"blank" + i} />;
              const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const cls = [
                "cal-day",
                ds === todayS ? "today" : "",
                ds === selectedDay ? "selected" : "",
              ].join(" ").trim();
              return (
                <Link
                  key={ds}
                  href={`/dashboard/calendar?year=${year}&month=${month}&day=${ds}`}
                  className={cls}
                >
                  {d}
                  {hasEvent(ds) && <span className="evt-dot" />}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="day-panel">
          <h3>{friendlyDateFull(selectedDay)}</h3>

          {selEvents.length === 0 && <p className="empty-state">No events on this date.</p>}
          {selEvents.map((e) => (
            <div className="evt-row" key={e.id}>
              <div className="evt-title">{e.title}</div>
              <div className="evt-meta">
                {e.event_time ? e.event_time + " · " : ""}
                {e.reminder_enabled ? `Reminder via ${e.reminder_channel}` : "No reminder"}
                {" · "}
                <form action={deleteEvent.bind(null, e.id)} style={{ display: "inline" }}>
                  <button type="submit" className="item-del">Remove</button>
                </form>
              </div>
            </div>
          ))}

          <form action={addEvent} className="event-form">
            <input type="hidden" name="date" value={selectedDay} />
            <label htmlFor="title">Add an event</label>
            <input id="title" name="title" type="text" placeholder="e.g. Pay electricity bill" required />
            <label htmlFor="time">Time (optional)</label>
            <input id="time" name="time" type="time" />
            <fieldset className="channel-row">
              <legend>Remind me via</legend>
              <label><input type="radio" name="channel" value="none" defaultChecked /> None</label>
              <label><input type="radio" name="channel" value="whatsapp" /> WhatsApp</label>
              <label><input type="radio" name="channel" value="sms" /> SMS</label>
            </fieldset>
            <button type="submit" className="btn-add">Save event</button>
            <p className="reminder-note">
              Reminders are saved here but nothing is sent yet — that's the deferred phase.
              See <code>lib/notifications/service.ts</code>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
