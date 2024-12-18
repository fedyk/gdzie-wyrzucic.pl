import Router from "koa-router";
import { IState, Context } from "./types.js";
import { welcome } from "./controllers/welcome.js";
import { search } from "./controllers/search.js";
import { sitemap } from "./controllers/sitemap.js";
import { all } from "./controllers/all.js";
import { layout } from "./middleware/layout.js";
import { template } from "./middleware/template.js";
import { login } from "./controllers/login.js";

export const router = new Router<IState, Context>();

router.get("/", template, layout, welcome)
router.all("/all", template, layout, all)
router.all("/search", template, layout, search)
router.get("/sitemap.xml", sitemap)

router.all("/login", login)
router.all("/tokens")
