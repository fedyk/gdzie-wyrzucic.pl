import * as Router from "koa-router";
import { AppState } from "./types/app-state";
import { templateMiddleware } from "./middlewares/template";

export const router = new Router<AppState>();

router.get("/", templateMiddleware, async (ctx) => {
  ctx.body = "ok";
})
