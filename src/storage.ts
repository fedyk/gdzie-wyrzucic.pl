import * as fs from "fs"
import Fuse from "fuse.js"
import * as config from "./config"
import * as types from "./types"

if (!fs.existsSync(config.WASTES_PATH)) {
  throw new Error("Cannot find a file "+ config.WASTES_PATH)
}

if (!fs.existsSync(config.CATEGORIES_PATH)) {
  throw new Error("Cannot find a file "+ config.CATEGORIES_PATH)
}

const wastes = require(config.WASTES_PATH) as types.Waste[]
const categories = require(config.CATEGORIES_PATH) as types.WasteCategory[]
const categoriesMap = new Map(categories.map(v => [v.id, v]))
const options = {
  includeScore: true,
  minMatchCharLength: 3,
  location: 0,
  threshold: 0.3,
  distance: 100,
  useExtendedSearch: false,
  keys: ["name.pl"]
}

const fuse = new Fuse<types.Waste, typeof options>(wastes, options);

export function search(query: string): Fuse.FuseResult<types.Waste>[] {
  return fuse.search(query)
}

export function getCategoryById(id: string) {
  return categoriesMap.get(id)
}
