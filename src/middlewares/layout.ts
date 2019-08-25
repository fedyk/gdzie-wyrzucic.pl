import { ParameterizedContext } from "koa";
import { layoutView } from "../views/layout-view";
import { AppState, AppContext } from "../types";

export async function layoutMiddleware(ctx: ParameterizedContext<AppState, AppContext>, next) {
  ctx.state.styles.push("/css/layout.css?1")

  await next()
  
  ctx.body = layoutView({
    body: ctx.body
  })
}
