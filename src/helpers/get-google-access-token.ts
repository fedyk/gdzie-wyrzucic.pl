import {stringify }from "querystring"
import { GOOGLE_REDIRECT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET }from "../config"
import fetch from "node-fetch"

export function getGoogleAccessToken(code: string) {
  const payload = {
    code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URL,
      grant_type: 'authorization_code',
  }

  const options = {
    method: "POST",
    body: stringify(payload),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  return fetch("https://oauth2.googleapis.com/token", options).then(resp => resp.json()).then(json => parseResponse(json))
}

function parseResponse(json: any) {
  return {
    accessToken: String(json.access_token),
    expirationDate: Date.now() + Number(json.expires_in) * 1000
  }
}
