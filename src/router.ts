import * as Router from "koa-router";
import { AppState } from "./types/app-state";

export const router = new Router<AppState>();

router.get("/", async (ctx) => {
  ctx.body = "ok";
})
