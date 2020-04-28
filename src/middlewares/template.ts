import { ParameterizedContext, Middleware } from "koa";
import { AppState, AppContext } from "../types";
import { templateView } from "../views/template-view";

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
export const templateMiddleware: Middleware<AppState, AppContext> = async function(ctx, next) {
  ctx.state.title = ""   
  ctx.state.description = ""
  ctx.state.scripts = []
  ctx.state.styles = []

  await next()

  ctx.response.type = "html"

  ctx.body = templateView({
    title: ctx.state.title,
    description: ctx.state.description,
    scripts: ctx.state.scripts,
    styles: ctx.state.styles,
    body: ctx.body,
  })
}
