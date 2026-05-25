import { Middleware } from "koa";
import { IState, Context } from "../types.js";
import { renderLayout } from "../views/layout.js";

export const layout: Middleware<IState, Context> = async function (ctx, next) {
  ctx.state.styles?.push(
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css",
    "/css/main.css"
  )

  ctx.state.scripts?.push(
    "https://code.jquery.com/jquery-3.4.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js",
  )

  ctx.state.headerQuery = "";

  await next()

  ctx.body = await renderLayout(
    ctx.body,
    ctx.state.headerQuery
  )
}
