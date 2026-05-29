import { Middleware } from "../types.js"
import { each, html } from "../html.js"
import { getCategories, getWastes } from "../storage.js"
import { categoryPath, wastePath } from "../seo.js"
import { APP_HOST } from "../config.ts"

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
  ctx.body = renderSitemap(urls).toString()
}

function getUrl(path: string) {
  return `https://${APP_HOST}${path}`
}

function renderSitemap(urls: string[]) {
  return html`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${each(urls, url => html`<url><loc>${url}</loc><changefreq>monthly</changefreq></url>`)}
    </urlset>
  `
}
