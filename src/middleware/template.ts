import { Middleware } from "koa";
import { IState, Context } from "../types.js";
import { renderView } from "../views.js";

/**
 * @example
 * 
 * Code:
 * ```
 * router.get("/", template, async (ctx) => {
 *   ctx.body = "Hello";
 * })
 * ```
 */
export const template: Middleware<IState, Context> = async function(ctx, next) {
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
