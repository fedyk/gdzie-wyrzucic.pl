import * as path from "path"
import { config as dotenv } from "dotenv";

dotenv({ path: __dirname + "/../.env" })

export const WASTES_PATH = path.resolve(__dirname, "../data/wastes.json")
export const CATEGORIES_PATH = path.resolve(__dirname, "../data/categories.json")
export const POINTS_PATH = path.resolve(__dirname, "../data/points.json")
export const GOOGLE_MAPS_STATIC_API_KEY = process.env.GOOGLE_MAPS_STATIC_API_KEY ?? void 0

interface Config {
  PORT: string | number
  APP_KEYS: string
}

if (!process.env.PORT) {
  console.warn("No port config. Set PORT environment variable(default is 3000).");
}

if (!process.env.APP_KEYS) {
  console.error("No keylist config. Set APP_KEYS environment variable. The format is <string_key1>;<string_key2>.");
}

if (!GOOGLE_MAPS_STATIC_API_KEY) {
  console.warn("No API Key for Google Static Map. Set GOOGLE_MAPS_STATIC_API_KEY environment variable. To obtain key see https://developers.google.com/maps/documentation/maps-static/get-api-key")
}

export const config: Config = {
  PORT: process.env.PORT || 3000,
  APP_KEYS: process.env.APP_KEYS || "",
};
