import * as fs from "fs"
import * as path from "path"
import * as assert from "assert"
import Fuse from "fuse.js"
import * as config from "./config"
import * as types from "./types"

const wastes = new Map<string, types.Waste2>()
const categories = new Map<string, types.Category2>()
const points = new Array<types.Point>()

const fuse = new Fuse<types.Waste2>([], {
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

  if (!fs.existsSync(config.POINTS_PATH)) {
    throw new Error("Cannot find a file " + path.basename(config.CATEGORIES_PATH))
  }

  const wastesJSON = require(config.WASTES_PATH)
  const categoriesJSON = require(config.CATEGORIES_PATH)
  const pointsJSON = require(config.POINTS_PATH)

  if (!Array.isArray(wastesJSON)) {
    throw new Error("`wasteJSON` should be an array")
  }

  if (!Array.isArray(categoriesJSON)) {
    throw new Error("`categoriesJSON` should be an array")
  }

  if (!Array.isArray(pointsJSON)) {
    throw new Error("`pointsJSON` should be an array")
  }

  wastesJSON.forEach(v => {
    assert.ok(v)
    assert.ok(typeof v.id === "string")
    assert.ok(typeof v.name === "string")
    assert.ok(Array.isArray(v.categoryIds))
    wastes.set(v.id, v)
  })

  categoriesJSON.forEach(v => {
    assert.ok(v)
    assert.ok(typeof v.id === "string")
    assert.ok(typeof v.name === "string")
    categories.set(v.id, v)
  })

  pointsJSON.forEach(v => {
    assert.ok(v)
    assert.ok(typeof v.id === "string")
    assert.ok(typeof v.name === "string")
    assert.ok(typeof v.lat === "number")
    assert.ok(typeof v.lng === "number")
    assert.ok(typeof v.address === "string")
    assert.ok(Array.isArray(v.categoryIds))
    points.push(v)
  })

  /**
   * Test code for playing with search
   */
  fuse.setCollection(wastesJSON)
}

export function findWastesByCategory(categoryId: string) {
  const result = new Array<types.Waste2>()

  for (const waste of wastes.values()) {
    if (waste.categoryIds.includes(categoryId)) {
      result.push(waste)
    }
  }

  return result
}

export function search(query: string, limit = 25): Fuse.FuseResult<types.Waste2>[] {
  return fuse.search(query, { limit: 25 }).sort((a, b) => (a?.score ?? 0) - (b?.score ?? 0))
}

export function getCategoryById(categoryId: string) {
  return categories.get(categoryId)
}

export function getCategories() {
  return Array.from(categories.values())
}

export function getCategoriesIds() {
  return Array.from(categories.keys())
}

export function getWastes() {
  return Array.from(wastes.values())
}

export function getWastesIds() {
  return Array.from(wastes.keys())
}

export function getWastesById(wasteId: string) {
  return wastes.get(wasteId)
}

/** @todo: optimization is required */
export function findPointsByCategoryId(categoryId: string) {
  return points.filter(function(p) {
    return p.categoryIds.includes(categoryId)
  })
}
