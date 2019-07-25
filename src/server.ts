import * as Koa from "koa";
import { join } from "path";
import * as serve from "koa-static";
import * as helmet from "koa-helmet";
import * as bodyParser from "koa-bodyparser";
import { router } from "./router";
import { config } from "./config";

const app = new Koa();

app.keys = config.APP_KEYS.split(";");
app.use(helmet())
app.use(bodyParser())
app.use(serve(join(__dirname, "../public")))
app.use(router.routes());

if (!module.parent) {
  app.listen(config.PORT, function() {
    console.log(`app is listening PORT ${config.PORT}`)
  });
}
