import * as querystring from "querystring"
import { Middleware } from "../types.js"
import { renderView } from "../views.js"
import { getWastesIds, getCategoriesIds } from "../storage.js"

export const sitemap: Middleware = async (ctx) => {
  const urls: string[] = [
    getUrl("/all")
  ]

  getWastesIds().forEach(wastesId => {
    urls.push(getSearchUrl({
      wid: wastesId
    }))
  })

  getCategoriesIds().forEach(categoryId => {
    urls.push(getSearchUrl({
      cid: categoryId
    }))
  })

  ctx.response.type = "application/xml"
  ctx.body = await renderView("sitemap.ejs", {
    urls: urls
  })

  function getSearchUrl(params: querystring.ParsedUrlQueryInput) {
    return getUrl("/search?" + querystring.stringify(params))
  }

  function getUrl(path: string) {
    return ctx.request.protocol + "://" + ctx.request.host + path
  }
}
