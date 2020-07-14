import Router from "koa-router";
import { AppState, AppContext } from "./types";
import { welcome } from "./controllers/welcome";
import { search } from "./controllers/search";
import { sitemap } from "./controllers/sitemap";
import { layout } from "./middlewares/layout";
import { template } from "./middlewares/template";

export const router = new Router<AppState, AppContext>();

router.get("/", template, layout, welcome)
router.all("/search", template, layout, search)
router.get("/sitemap.xml", sitemap)
