import { ParameterizedContext } from "koa";
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
export async function templateMiddleware(ctx: ParameterizedContext<AppState, AppContext>, next) {
  ctx.state.title = ""   
  ctx.state.description = ""
  ctx.state.scripts = []
  ctx.state.styles = [
    "/css/main.css?1"
  ];

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
