import { Middleware } from "koa";
import { AppState, AppContext } from "./types";

const locales = new Map<string, object>();

export const i18Middleware: Middleware<AppState, AppContext> = async (ctx, next) => {
  ctx.i18n = function(phrase: string) {
    // todo: implement detectLocale(ctx: AppContext): string function
    // @see https://github.com/koajs/locales
    // @see https://github.com/opentable/accept-language-parser
    // @see https://github.com/lxzxl/koa-i18next-detector
    // @see https://i18next.github.io/i18next-scanner/
    // const locale = detectLocale(ctx);
    return phrase;
  }
  await next();
}

// TODO: add locales files and detect logic(session is required)
function i18n(phrase: string, lang: string) {
  if (!locales.has(lang)) {
    locales.set(lang, require('./locales/' + lang));
  }

  const locale = locales.get(lang);

  return locale && locale[phrase] || phrase;
}
