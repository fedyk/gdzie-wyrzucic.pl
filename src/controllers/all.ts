
import { Middleware } from "koa";
import * as querystring from "querystring";
import * as storage from "../storage"
import { AppContext, AppState } from "../types";
import { renderView } from "../views";

export const all: Middleware<AppState, AppContext> = async function (ctx) {
  const wastes = storage.getWastes()

  ctx.body = await renderView("all.ejs", {
    results: getResults(wastes)
  })
}

function getResults(wastes: ReturnType<typeof storage.getWastes>) {
  return wastes.map(function (waste) {
    return {
      id: waste.id,
      name: waste.name,
      url: "/search?" + querystring.stringify({
        wid: waste.id
      }),
      categories: waste.categoryIds.map(categoryId => {
        const category = storage.getCategoryById(categoryId)
        const name = category?.name ?? "Unknown category"
        const url = "/search?" + querystring.stringify({ q: name, cid: categoryId, })

        return {
          url,
          name
        }
      })
    }
  })
}
