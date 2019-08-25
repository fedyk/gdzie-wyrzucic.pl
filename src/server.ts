import * as Koa from "koa";
import { join } from "path";
import * as serve from "koa-static";
import * as helmet from "koa-helmet";
import * as bodyParser from "koa-bodyparser";
import { Client } from "@elastic/elasticsearch"
import { router } from "./router";
import { config } from "./config";
import { AppState, AppContext } from "./types";

const app = new Koa<AppState, AppContext>();

app.context.elasticClient = new Client({
  node: config.ELASTIC_SEARCH
})

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
