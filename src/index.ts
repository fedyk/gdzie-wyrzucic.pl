import Koa from "koa";
import { join } from "path";
import serve from "koa-static";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import { router } from "./router";
import { router as api } from "./api/router";
import { PORT, APP_KEYS } from "./config";
import { IState, IContext } from "./types";
import { loadData } from "./storage";

const app = new Koa<IState, IContext>();

app.keys = APP_KEYS
app.use(helmet())
app.use(bodyParser())
app.use(serve(join(__dirname, "../public")))
app.use(router.routes());
app.use(api.routes());
app.use(api.allowedMethods());

loadData()

app.listen(PORT, function() {
  console.log(`app is listening PORT ${PORT}`)
});
