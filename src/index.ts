import Koa from "koa";
import { join } from "path";
import serve from "koa-static";
import bodyParser from "koa-bodyparser";
import { router } from "./router.js";
import { router as api } from "./api/router.js";
import { PORT, APP_KEYS } from "./config.js";
import { IState, IContext } from "./types.js";
import { loadData } from "./storage.js";

const app = new Koa<IState, IContext>();

app.keys = APP_KEYS
app.use(bodyParser())
app.use(serve(join("public")))
app.use(router.routes());
app.use(api.routes());
app.use(api.allowedMethods());

loadData()

app.listen(PORT, function() {
  console.log(`app is listening PORT ${PORT}`)
});
