import { Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { renderView } from "../views";

/**
 * @example
 * 
 * Code:
 * ```
 * router.get("/", templateMiddleware, async (ctx) => {
 *   ctx.body = "Hello";
 * })
 * ```
 */
export const template: Middleware<AppState, AppContext> = async function(ctx, next) {
  ctx.state.title = ""   
  ctx.state.description = ""
  ctx.state.scripts = []
  ctx.state.styles = []

  await next()

  ctx.response.type = "html"

  ctx.body = await renderView("template.ejs", {
    title: ctx.state.title,
    description: ctx.state.description,
    scripts: ctx.state.scripts,
    styles: ctx.state.styles,
    body: ctx.body,
  })
}
