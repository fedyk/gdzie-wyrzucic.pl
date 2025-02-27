import { Middleware } from "../types.js";
import { getGoogleAuthUrl } from "../helpers/get-google-auth-url.js";
import { getGoogleAccessToken } from "../helpers/get-google-access-token.js";
import { getGoogleAccessTokenInfo } from "../helpers/get-google-access-token-info.js";

export const login: Middleware = async function (ctx) {
  let token: any = null
  let info: any = null
  const code = String(ctx.request.query.code || "")
  const access_token = String(ctx.request.query.access_token || "")

  if (code) {
    token = await getGoogleAccessToken(code).catch(err => console.warn(err))
  }
  else if (access_token) {
    info = await getGoogleAccessTokenInfo(access_token)
  }
  else {
    return ctx.redirect(getGoogleAuthUrl())
  }
}
