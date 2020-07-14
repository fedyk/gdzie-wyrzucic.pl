import * as querystring from "querystring"
import { Middleware } from "../types"
import { renderView } from "../views"
import { getWastesIds, getCategoriesIds } from "../storage"

export const sitemap: Middleware = async (ctx) => {
  const urls: string[] = []

  getWastesIds().forEach(wastesId => {
    urls.push(ctx.request.protocol + "://" + ctx.request.host + "/search?" + querystring.stringify({
      wid: wastesId
    }))
  })
  
  getCategoriesIds().forEach(categoryId => {
    urls.push(ctx.request.protocol + "://" + ctx.request.host + "/search?" + querystring.stringify({
      cid: categoryId
    }))
  })

  ctx.response.type = "application/xml"
  ctx.body = await renderView("sitemap.ejs", {
    urls: urls
  })
}
