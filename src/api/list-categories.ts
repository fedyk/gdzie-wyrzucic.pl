import { Context } from "../types.js";
import { getCategories } from "../storage.js";

export async function listCategories(ctx: Context) {
  ctx.body = await getCategories()
}
