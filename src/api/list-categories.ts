import { Context } from "../types";
import { getCategories } from "../storage";

export async function listCategories(ctx: Context) {
  ctx.body = await getCategories()
}
