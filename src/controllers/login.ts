import { Middleware } from "../types";
import { getGoogleAuthUrl } from "../helpers/get-google-auth-url";
import { getGoogleAccessToken } from "../helpers/get-google-access-token";
import { getGoogleAccessTokenInfo } from "../helpers/get-google-access-token-info";

export const login: Middleware = async function (ctx) {
  let token: any = null
  let info: any = null

  if (ctx.request.query.code) {
    token = await getGoogleAccessToken(ctx.request.query.code).catch(err => console.warn(err))
  }
  else if (ctx.request.query.access_token) {
    info = await getGoogleAccessTokenInfo(ctx.request.query.access_token)
  }
  else {
    return ctx.redirect(getGoogleAuthUrl())
  }
}
