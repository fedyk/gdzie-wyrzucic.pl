import {stringify }from "querystring"

export function getGoogleAccessTokenInfo(accessToken: string) {
  const payload = {
    access_token: accessToken
  }

  const options = {
    method: "POST",
    body: stringify(payload),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  return fetch("https://oauth2.googleapis.com/tokeninfo", options).then(resp => resp.json()).then(json => parseResponse(json))
}

function parseResponse(json: any) {
  return {
    email: String(json?.email),
    emailVerified: json.email_verified === "true",
  }
}
