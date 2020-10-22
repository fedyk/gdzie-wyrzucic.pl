// todo: implement detectLocale(ctx: AppContext): string function
// @see https://github.com/koajs/locales
// @see https://github.com/opentable/accept-language-parser
// @see https://github.com/lxzxl/koa-i18next-detector
// @see https://i18next.github.io/i18next-scanner/
// const locale = detectLocale(ctx);

// const locales = new Map<string, object>();

// export const i18Middleware: Middleware<IState, IContext> = async (ctx, next) => {
//   ctx.i18n = function(phrase: string) {
    
//     return phrase;
//   }
//   await next();
// }

// // TODO: add locales files and detect logic(session is required)
// function i18n(phrase: string, lang: string) {
//   if (!locales.has(lang)) {
//     locales.set(lang, require('./locales/' + lang));
//   }

//   const locale = locales.get(lang);

//   // @ts-ignore
//   return locale ? locale[phrase] :  phrase;
// }
