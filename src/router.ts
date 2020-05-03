import * as Router from "koa-router";
import { AppState, AppContext } from "./types";
import { welcome } from "./controllers/welcome";
import { search } from "./controllers/search";
import { search as search2 } from "./controllers/search2";
import { layoutMiddleware } from "./middlewares/layout";
import { templateMiddleware } from "./middlewares/template";

export const router = new Router<AppState, AppContext>();

router.get("/", templateMiddleware, layoutMiddleware, welcome);
router.all("/search", templateMiddleware, layoutMiddleware, search);
router.all("/search2", templateMiddleware, layoutMiddleware, search2);
