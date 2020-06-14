import Koa from "koa";
import { join } from "path";
import serve from "koa-static";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import { i18Middleware } from "./i18n";
import { router } from "./router";
import { config } from "./config";
import { AppState, AppContext } from "./types";
import { loadData } from "./storage";

const app = new Koa<AppState, AppContext>();

app.keys = config.APP_KEYS.split(";");
app.use(helmet())
app.use(bodyParser())
app.use(serve(join(__dirname, "../public")))
app.use(i18Middleware)
app.use(router.routes());

if (!module.parent) {
  loadData()

  app.listen(config.PORT, function() {
    console.log(`app is listening PORT ${config.PORT}`)
  });
}
