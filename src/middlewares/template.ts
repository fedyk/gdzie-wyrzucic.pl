import { ParameterizedContext } from "koa";
import { AppState } from "../types/app-state";
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
export async function templateMiddleware(ctx: ParameterizedContext<AppState>, next) {
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
