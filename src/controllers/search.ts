import { Context } from "koa";
import { searchView } from "../views/search-view";

export async function search(ctx: Context) {
  ctx.body = searchView({
    query: ctx.query.q
  })
}
