import { Context } from "../types";
import { getWastes } from "../storage";

export async function listWastes(ctx: Context) {
  ctx.body = await getWastes()
}
