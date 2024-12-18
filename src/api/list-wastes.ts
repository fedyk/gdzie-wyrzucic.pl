import { Context } from "../types.js";
import { getWastes } from "../storage.js";

export async function listWastes(ctx: Context) {
  ctx.body = await getWastes()
}
