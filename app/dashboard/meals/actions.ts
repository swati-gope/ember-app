"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Called directly from the MealCell client component (not via a
// <form>), so this is plain args in, no FormData involved.
export async function upsertMeal(date: string, slot: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("meal_plan")
    .upsert(
      { user_id: user.id, plan_date: date, slot, content },
      { onConflict: "user_id,plan_date,slot" }
    );

  revalidatePath("/dashboard/meals");
}
