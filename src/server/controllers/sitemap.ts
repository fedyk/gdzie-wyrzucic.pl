import { Middleware } from "../types.js"
import { getCategories, getWastes } from "../storage.js"
import { renderSitemap } from "../views/sitemap.js"
import { categoryPath, wastePath } from "../seo.js"

export const sitemap: Middleware = async (ctx) => {
  const urls: string[] = [
    getUrl("/"),
    getUrl("/all")
  ]

  getWastes().forEach(waste => {
    urls.push(getUrl(wastePath(waste)))
  })

  getCategories().forEach(category => {
    urls.push(getUrl(categoryPath(category)))
  })

  ctx.response.type = "application/xml"
  ctx.body = await renderSitemap(urls)

  function getUrl(path: string) {
    return ctx.request.protocol + "://" + ctx.request.host + path
  }
}
