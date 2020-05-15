import * as fs from "fs"
import * as path from "path"
import * as assert from "assert"
import Fuse from "fuse.js"
import * as config from "./config"
import * as types from "./types"

const wastes = new Map<string, types.Waste2>()
const categories = new Map<string, types.Category2>()

const fuse = new Fuse<types.Waste2, {}>([], {
  includeScore: true,
  minMatchCharLength: 3,
  location: 0,
  threshold: 0.3,
  distance: 100,
  useExtendedSearch: false,
  keys: ["name"]
});

export function loadData() {
  if (!fs.existsSync(config.WASTES_PATH)) {
    throw new Error("Cannot find a file " + path.basename(config.WASTES_PATH))
  }

  if (!fs.existsSync(config.CATEGORIES_PATH)) {
    throw new Error("Cannot find a file " + path.basename(config.CATEGORIES_PATH))
  }

  const wastesJSON = require(config.WASTES_PATH)

  if (!Array.isArray(wastesJSON)) {
    throw new Error("`wasteJSON` should be an array")
  }

  wastesJSON.forEach(v => {
    assert.ok(v)
    assert.ok(typeof v.id === "string")
    assert.ok(typeof v.name === "string")
    assert.ok(Array.isArray(v.categoryIds))
    wastes.set(v.id, v)
  })

  const categoriesJSON = require(config.CATEGORIES_PATH)

  if (!Array.isArray(categoriesJSON)) {
    throw new Error("`categoriesJSON` should be an array")
  }

  categoriesJSON.forEach(v => {
    assert.ok(v)
    assert.ok(typeof v.id === "string")
    assert.ok(typeof v.name === "string")
    categories.set(v.id, v)
  })

  /**
   * Test code for playing with search
   */
  fuse.setCollection(wastesJSON)
}

export function search(query: string): Fuse.FuseResult<types.Waste2>[] {
  return fuse.search(query)
}

export function getCategoryById(categoryId: string) {
  return categories.get(categoryId)
}
