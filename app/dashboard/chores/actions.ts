"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayStr, getMonday, weekDates } from "@/lib/dates";

// Bound as toggleChoreToday.bind(null, choreId) on each daily chore's
// form — the trailing FormData argument is appended automatically by
// React when the bound action is used as a <form action>.
export async function toggleChoreToday(choreId: string, _formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const today = todayStr();
  const { data: existing } = await supabase
    .from("chore_completions")
    .select("id")
    .eq("chore_id", choreId)
    .eq("done_date", today)
    .maybeSingle();

  if (existing) {
    await supabase.from("chore_completions").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("chore_completions")
      .insert({ chore_id: choreId, user_id: user.id, done_date: today });
  }

  revalidatePath("/dashboard/chores");
}

// Weekly chores: "done" means any completion landed within the current
// Mon–Sun week. Toggling off clears every completion in that window.
export async function toggleChoreThisWeek(choreId: string, _formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const days = weekDates(getMonday(todayStr()));
  const { data: existing } = await supabase
    .from("chore_completions")
    .select("id")
    .eq("chore_id", choreId)
    .in("done_date", days);

  if (existing && existing.length > 0) {
    await supabase
      .from("chore_completions")
      .delete()
      .in("id", existing.map((e) => e.id));
  } else {
    await supabase.from("chore_completions").insert({
      chore_id: choreId,
      user_id: user.id,
      done_date: todayStr(),
    });
  }

  revalidatePath("/dashboard/chores");
}
