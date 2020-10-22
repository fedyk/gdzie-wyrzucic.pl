import * as path from "path"
import { config as dotenv } from "dotenv";
import { parseTrustedEmails } from "./parsers";

dotenv({ path: __dirname + "/../.env" })

export const PORT = Number(process.env.PORT ?? 3000)
export const APP_KEYS = String(process.env.APP_KEYS).split(";")
export const WASTES_PATH = path.resolve(__dirname, "../data/wastes.json")
export const CATEGORIES_PATH = path.resolve(__dirname, "../data/categories.json")
export const POINTS_PATH = path.resolve(__dirname, "../data/points.json")
export const GOOGLE_MAPS_STATIC_API_KEY = process.env.GOOGLE_MAPS_STATIC_API_KEY ?? void 0
export const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID)
export const GOOGLE_CLIENT_SECRET = String(process.env.GOOGLE_CLIENT_SECRET)
export const GOOGLE_REDIRECT_URL = String(process.env.GOOGLE_REDIRECT_URL)
export const TRUSTED_EMAILS = parseTrustedEmails(process.env.TRUSTED_EMAILS)

if (!process.env.APP_KEYS) {
  console.error("No keylist config. Set APP_KEYS environment variable. The format is <string_key1>;<string_key2>.");
}

if (!GOOGLE_MAPS_STATIC_API_KEY) {
  console.warn("No API Key for Google Static Map. Set GOOGLE_MAPS_STATIC_API_KEY environment variable. To obtain key see https://developers.google.com/maps/documentation/maps-static/get-api-key")
}
