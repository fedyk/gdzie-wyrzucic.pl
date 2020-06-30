import * as querystring from "querystring";
import { Middleware } from "../types";
import { renderView } from "../views";

export const welcome: Middleware = async function (ctx) {
  ctx.state.title = ctx.i18n("Jak prawidłowo segregować śmieci?")

  ctx.body = await renderView("welcome.ejs", {
    queries: [
      createQueryParams("baterie"),
      createQueryParams("maski"),
      createQueryParams("rękawiczki"),
    ]
  })
}

function createQueryParams(q: string) {
  return {
    url: "/search?" + querystring.stringify({ q }),
    text: q
  }
}
