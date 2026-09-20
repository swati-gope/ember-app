"use client";

import { useState, useTransition } from "react";

// The only client component in the dashboard — needed because typing
// into a textarea has to update local state immediately, with the save
// happening on blur rather than on every keystroke.
export function MealCell({
  date,
  slot,
  initial,
  onSave,
}: {
  date: string;
  slot: string;
  initial: string;
  onSave: (date: string, slot: string, content: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== initial) {
          startTransition(() => {
            onSave(date, slot, value);
          });
        }
      }}
      placeholder="—"
      disabled={isPending}
    />
  );
}
