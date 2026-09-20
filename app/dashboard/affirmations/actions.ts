"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/dates";

export async function addReflection(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const text = (formData.get("text") as string)?.trim();
  if (!text) return;

  await supabase
    .from("affirmation_entries")
    .insert({ user_id: user.id, entry_date: todayStr(), text });

  revalidatePath("/dashboard/affirmations");
}
