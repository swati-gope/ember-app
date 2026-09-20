"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayStr } from "@/lib/dates";

export async function addTodo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const text = (formData.get("text") as string)?.trim();
  if (!text) return;

  await supabase.from("todos").insert({ user_id: user.id, date: todayStr(), text });
  revalidatePath("/dashboard");
}

export async function toggleTodo(id: string, done: boolean, _formData: FormData) {
  const supabase = await createClient();
  await supabase.from("todos").update({ done: !done }).eq("id", id);
  revalidatePath("/dashboard");
}
