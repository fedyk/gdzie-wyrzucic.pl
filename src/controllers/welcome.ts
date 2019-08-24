import { Context } from "koa";
import { welcomeView } from "../views/welcome-view";

export async function welcome(ctx: Context) {
  ctx.body = welcomeView()
}
