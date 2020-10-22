import Router from "koa-router";
import { IState, Context } from "./types";
import { welcome } from "./controllers/welcome";
import { search } from "./controllers/search";
import { sitemap } from "./controllers/sitemap";
import { all } from "./controllers/all";
import { layout } from "./middleware/layout";
import { template } from "./middleware/template";
import { login } from "./controllers/login";

export const router = new Router<IState, Context>();

router.get("/", template, layout, welcome)
router.all("/all", template, layout, all)
router.all("/search", template, layout, search)
router.get("/sitemap.xml", sitemap)

router.all("/login", login)
router.all("/tokens")
