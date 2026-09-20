import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addDays, friendlyDate, getMonday, todayStr, weekDates } from "@/lib/dates";
import { MealCell } from "./MealCell";
import { upsertMeal } from "./actions";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["breakfast", "lunch", "dinner"] as const;

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const monday = params.week ?? getMonday(todayStr());
  const days = weekDates(monday);
  const prevWeek = addDays(monday, -7);
  const nextWeek = addDays(monday, 7);

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("meal_plan")
    .select("*")
    .in("plan_date", days);

  const valueFor = (date: string, slot: string) =>
    rows?.find((r) => r.plan_date === date && r.slot === slot)?.content ?? "";

  return (
    <div>
      <h1>Plan the week's meals</h1>
      <p className="sub">Click a cell to fill it in — it saves when you click away.</p>

      <div className="week-nav">
        <Link href={`/dashboard/meals?week=${prevWeek}`}>← Previous</Link>
        <span className="lbl">
          {friendlyDate(days[0])} – {friendlyDate(days[6])}
        </span>
        <Link href={`/dashboard/meals?week=${nextWeek}`}>Next →</Link>
      </div>

      <div className="meal-grid">
        <div className="cell head" />
        {days.map((d, i) => (
          <div className="cell head" key={d}>
            {DOW[i]}
            <br />
            <span className="dim">{friendlyDate(d)}</span>
          </div>
        ))}

        {SLOTS.map((slot) => (
          <div className="meal-row" key={slot}>
            <div className="cell rowlbl">{slot[0].toUpperCase() + slot.slice(1)}</div>
            {days.map((d) => (
              <div className="cell" key={d + slot}>
                <MealCell date={d} slot={slot} initial={valueFor(d, slot)} onSave={upsertMeal} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
