import { GOOGLE_REDIRECT_URL, GOOGLE_CLIENT_ID } from "../config.js"

export function getGoogleAuthUrl() {
  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URL)}&` +
    `response_type=code&` +
    `scope=email`
}
