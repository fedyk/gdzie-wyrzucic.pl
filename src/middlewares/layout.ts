import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { renderView } from "../views";

export const layout: Middleware<AppState, AppContext> = async function (ctx, next) {
  ctx.state.styles?.push(
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
    "/css/main.css?1"
  )

  ctx.state.scripts?.push(
    "https://code.jquery.com/jquery-3.4.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js",
  )

  ctx.state.headerQuery = "";

  await next()

  ctx.body = await renderView("layout.ejs", {
    body: ctx.body,
    query: ctx.state.headerQuery
  })
}
