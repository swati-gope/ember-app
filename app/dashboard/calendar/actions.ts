"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const date = formData.get("date") as string;
  const title = (formData.get("title") as string)?.trim();
  const time = formData.get("time") as string;
  const channel = formData.get("channel") as string;
  if (!title) return;

  await supabase.from("events").insert({
    user_id: user.id,
    event_date: date,
    title,
    event_time: time || null,
    // Saved now, but nothing sends anything yet — see
    // lib/notifications/service.ts for the deferred Reminders phase.
    reminder_enabled: channel !== "none",
    reminder_channel: channel === "none" ? null : channel,
  });

  revalidatePath("/dashboard/calendar");
}

export async function deleteEvent(id: string, _formData: FormData) {
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/dashboard/calendar");
}
