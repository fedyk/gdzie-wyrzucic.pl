import { ParameterizedContext } from "koa";
import { AppState } from "../types/app-state";
import { layoutView } from "../views/layout-view";

export async function layoutMiddleware(ctx: ParameterizedContext<AppState>, next) {
  ctx.state.styles.push("/css/layout.css?1")

  await next()
  
  ctx.body = layoutView({
    body: ctx.body
  })
}
