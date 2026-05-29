import { Middleware } from "../types.js";
import { APP_HOST } from "../config.js";

const hostAliases = new Set([
  APP_HOST,
  APP_HOST.startsWith("www.") ? APP_HOST.slice(4) : "www." + APP_HOST,
])

export const canonicalOrigin: Middleware = async (ctx, next) => {
  const host = ctx.host

  if (!hostAliases.has(host)) {
    return next()
  }

  if (ctx.protocol === "https" && host === APP_HOST) {
    return next()
  }

  ctx.status = 301
  ctx.redirect(`https://${APP_HOST}/${ctx.originalUrl}`)
}
