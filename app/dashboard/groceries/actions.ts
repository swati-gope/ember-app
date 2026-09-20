"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addGrocery(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const text = (formData.get("text") as string)?.trim();
  if (!text) return;

  await supabase.from("groceries").insert({ user_id: user.id, text });
  revalidatePath("/dashboard/groceries");
}

export async function toggleGrocery(id: string, done: boolean, _formData: FormData) {
  const supabase = await createClient();
  await supabase.from("groceries").update({ done: !done }).eq("id", id);
  revalidatePath("/dashboard/groceries");
}

export async function deleteGrocery(id: string, _formData: FormData) {
  const supabase = await createClient();
  await supabase.from("groceries").delete().eq("id", id);
  revalidatePath("/dashboard/groceries");
}
