import * as querystring from "querystring";
import { Middleware } from "../types.js";
import { renderView } from "../views.js";

export const welcome: Middleware = async function (ctx) {
  ctx.state.title = "Jak prawidłowo segregować śmieci?"

  ctx.body = await renderView("welcome.ejs", {
    queries: [
      createQueryParams("ubrania"),
      createQueryParams("opakowanie"),
      createQueryParams("butelke"),
      createQueryParams("choinke"),
      createQueryParams("żarówke"),
      createQueryParams("dywan"),
      createQueryParams("sprzęt komputerowy"),
      createQueryParams("leki"),
      createQueryParams("płyta kompaktowa"),
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
