import * as querystring from "querystring";
import { Middleware } from "../types.js";
import { renderWelcome } from "../views/welcome.js";
import { setPageMeta } from "../seo.js";

export const welcome: Middleware = async function (ctx) {
  setPageMeta(ctx, {
    title: "Jak prawidłowo segregować śmieci?",
    description: "Sprawdź, gdzie wyrzucić odpady i jak prawidłowo segregować śmieci. Wyszukaj przedmiot i zobacz właściwy pojemnik lub punkt odbioru.",
    canonicalPath: "/",
  })

  ctx.body = renderWelcome([
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
  ])
}

function createQueryParams(q: string) {
  return {
    url: "/search?" + querystring.stringify({ q }),
    text: q
  }
}
