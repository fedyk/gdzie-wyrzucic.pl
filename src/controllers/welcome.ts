import { Middleware } from "koa";
import { welcomeView } from "../views/welcome-view";
import { format } from "util";
import { AppState, AppContext } from "../types";

export const welcome: Middleware<AppState, AppContext> = function(ctx) {
  ctx.state.title = ctx.i18n("Jak prawidłowo segregować śmieci?")
  ctx.body = welcomeView()
}
