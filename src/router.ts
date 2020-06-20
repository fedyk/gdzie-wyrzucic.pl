import Router from "koa-router";
import { AppState, AppContext } from "./types";
import { welcome } from "./controllers/welcome";
import { search } from "./controllers/search";
import { layout } from "./middlewares/layout";
import { templateMiddleware } from "./middlewares/template";

export const router = new Router<AppState, AppContext>();

router.get("/", templateMiddleware, layout, welcome);
router.all("/search", templateMiddleware, layout, search);
