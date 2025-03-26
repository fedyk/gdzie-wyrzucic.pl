import { each, html } from "../html.js"

export function renderSitemap(urls: string[]) {
  return html`
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${each(urls, url => html`<url><loc>${url}</loc><changefreq>monthly</changefreq></url>`)}
    </urlset>
  `
}