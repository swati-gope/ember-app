import { createClient } from "@/lib/supabase/server";
import { addGrocery, toggleGrocery, deleteGrocery } from "./actions";

export default async function GroceriesPage() {
  const supabase = await createClient();
  const { data: groceries } = await supabase
    .from("groceries")
    .select("*")
    .order("created_at");

  return (
    <div>
      <h1>This week's shopping list</h1>
      <p className="sub">Add items as they come to mind — check them off at the store.</p>

      <form action={addGrocery} className="todo-add">
        <input name="text" type="text" placeholder="Add an item…" required />
        <button type="submit" className="btn-add">Add</button>
      </form>

      {(!groceries || groceries.length === 0) && (
        <p className="empty-state">
          Your list is empty. Add items as you plan meals for the week.
        </p>
      )}

      {groceries?.map((g) => (
        <div className="grocery-item" key={g.id}>
          <form action={toggleGrocery.bind(null, g.id, g.done)}>
            <button
              type="submit"
              className={`checkbox ${g.done ? "on" : ""}`}
              aria-label={`Mark ${g.text} ${g.done ? "not bought" : "bought"}`}
            >
              {g.done ? "✓" : ""}
            </button>
          </form>
          <span className={`item-text ${g.done ? "done" : ""}`}>{g.text}</span>
          <form action={deleteGrocery.bind(null, g.id)}>
            <button type="submit" className="item-del">Remove</button>
          </form>
        </div>
      ))}
    </div>
  );
}
