import { createClient } from "@/lib/supabase/server";
import { AFFIRMATIONS } from "@/lib/affirmations";
import { dayOfYear, friendlyDateFull } from "@/lib/dates";
import { addReflection } from "./actions";

export default async function AffirmationsPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("affirmation_entries")
    .select("*")
    .order("entry_date", { ascending: false });

  const idx = dayOfYear(new Date()) % AFFIRMATIONS.length;

  return (
    <div>
      <h1>Today's affirmation</h1>
      <div className="affirm-big">&ldquo;{AFFIRMATIONS[idx]}&rdquo;</div>

      <h2>Write it in your own words</h2>
      <form action={addReflection} className="affirm-write">
        <textarea name="text" placeholder="What does this mean for you today?" required />
        <button type="submit" className="btn-add">Save reflection</button>
      </form>

      <div className="affirm-list">
        {(!entries || entries.length === 0) && (
          <p className="empty-state">Your written reflections will show up here.</p>
        )}
        {entries?.map((e) => (
          <div className="affirm-entry" key={e.id}>
            <div className="d">{friendlyDateFull(e.entry_date)}</div>
            <p>{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
