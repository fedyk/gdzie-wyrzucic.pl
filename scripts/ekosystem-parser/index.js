const fs = require("fs")
const url = require("url")
const https = require("https")
const path = require("path")
const assert = require("assert")
const crypto = require("crypto")
const HTMLParser = require("node-html-parser")
const querystring = require("querystring")
const cachedPhrases = require('./phrases.json');
const productsPath = path.resolve(__dirname, "products.json")
const categoriesPath = path.resolve(__dirname, "categories.json")
const pointsTypesPath = path.resolve(__dirname, "points-types.json")
const pointsPath = path.resolve(__dirname, "points.json")
const pointsParsedPath = path.resolve(__dirname, "points-parsed.json")
const wastesPath = path.resolve(__dirname, "wastes.json")
const wastesCURLPath = path.resolve(__dirname, "wastes.curl")
const [, , action] = process.argv;

const help = `
Usage: node index.js <action>

node index.js sync-phrases         fetch and save autocomplete results to file 'phases.json'
node index.js sync-products        fetch and save phrase search results to 'products.json'
node index.js prepare-categories   extract categories from the products(${path.basename(productsPath)})
node index.js prepare-wastes       extract wastes to PUT in ES
node index.js sync-points          fetch and save map points to 'points.json'
node index.js parse-points         parse fetched point and assign them with categories data, the output 'parsed-points.json'
`

switch (action) {
  case "sync-phrases":
    return syncPhrases();

  case "sync-products":
    return syncProducts();

  case "sync-points":
    return syncPoints()

  case "parse-points":
    return parsePoints()

  case "prepare-categories":
    return parseCategories()

  case "prepare-wastes":
    return prepareWastes()

  default:
    console.log(help)
}

function get(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (resp) {
      let data = '';

      resp.on('data', function (chunk) {
        data += chunk
      })

      resp.on('end', function () {
        resolve(data)
      });
    }).on("error", function (error) {
      reject(error);
    })
  })
}

function post(postUrl, data) {
  const postData = querystring.stringify(data);
  const parsedUrl = url.parse(postUrl)
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": postData.length
    }
  }

  return new Promise(function (resolve, reject) {
    const request = https.request(options, function (resp) {
      let data = '';

      resp.on('data', function (chunk) {
        data += chunk
      })

      resp.on('end', function () {
        resolve(data)
      })
    })

    request.on("error", function (error) {
      reject(error);
    })

    request.write(postData)
    request.end()
  })
}

async function fetchPhrases() {
  const phrases = new Map();
  const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  // for (let i = 0; i < alphabet.length; i++) {
  for (let i = 0; i < alphabet.length; i++) {
    const url = `https://ekosystem.wroc.pl/admin/admin-ajax.php?action=gdzie-wrzucic&term=${alphabet[i]}`;
    const data = await get(url);
    const items = JSON.parse(data);

    for (let j = 0; j < items.length; j++) {
      const item = items[j];

      phrases.set(item.id, item.id)
    }
  }

  return phrases;
}

async function getSearchPage(phrase) {
  const url = `https://ekosystem.wroc.pl/segregacja-odpadow/gdzie-wrzucic/?odpad=${encodeURIComponent(phrase)}`;
  const html = await get(url);

  return html;
}

function parsePhraseResults(html) {
  const results = []
  const parsedHTML = HTMLParser.parse(html);
  const parsedResults = parsedHTML.querySelectorAll('.gdzie-wrzucic-result')

  for (let i = 0; i < parsedResults.length; i++) {
    const parsedResult = parsedResults[i]
    const parsedResultNameEl = parsedResult.querySelector('.odpad-name')
    const parsedCategories = parsedResult.querySelectorAll('.pojemnik')
    const phrase = parsedResultNameEl && parsedResultNameEl.text.trim();
    const categories = [];

    for (let j = 0; j < parsedCategories.length; j++) {
      const categoryEl = parsedCategories[j];
      const classNames = categoryEl.classNames;

      const nameEl = categoryEl.querySelector('.pojemnik-name')
      const name = nameEl ? nameEl.text.trim() : null

      const links = categoryEl.querySelectorAll('a').map(function (anchor) {
        return {
          href: anchor.attributes && anchor.attributes.href || null,
          text: anchor.text.trim()
        }
      })

      categories.push({
        name,
        classNames,
        links
      })
    }

    results.push({
      phrase,
      categories
    })
  }

  return results;
}

async function saveSearchResults() {
  const results = new Map();

  for (let i = 0; i < cachedPhrases.length; i++) {
    const phrase = cachedPhrases[i];

    console.log("fetch & parse: %s", phrase)

    const html = await getSearchPage(phrase);
    const parsedResults = parsePhraseResults(html);

    for (let j = 0; j < parsedResults.length; j++) {
      const parsedResult = parsedResults[j];

      results.set(parsedResult.phrase, parsedResult.categories);
    }
  }

  return results;
}

async function fetchPoints() {
  const pointTypes = require(pointsTypesPath);
  const url = `https://mapa.ekosystem.wroc.pl/admin/admin-ajax.php`
  const results = new Map();

  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < pointTypes.length; i++) {
    const pointType = pointTypes[i];

    if (typeof pointType !== "object") {
      throw new Error("`pointType` should be an object")
    }

    const query = pointType.query

    if (typeof query !== "string") {
      throw new Error("`query` should be a string")
    }

    const resp = await post(url, {
      action: "get-points",
      "points[]": query
    })

    let parserResponse

    try {
      parserResponse = JSON.parse(resp)
    }
    catch (err) {
      console.error("fetchPoints", err)
    }

    const markers = parserResponse && parserResponse.markers || void 0;

    if (!Array.isArray(markers)) {
      console.warn(query, "has no markets")
    }
    else {
      results.set(query, markers);
    }
  }

  return results;
}

function parsePoints() {
  const pointTypes = require(pointsTypesPath);
  const pointsGroups = require(pointsPath)

  /**
   * @type {Map<query: string, categoryId: string>}
   */
  const pointTypesMap = new Map(pointTypes.map(v => [v.query, v.categoryId]))
  const parsedPoints = new Map()

  assert.ok(Array.isArray(pointsGroups), new Error("`points` should be an array"))

  pointsGroups.forEach(function (pointGroup) {
    assert.ok(Array.isArray(pointGroup), new Error("`pointGroup` should be an array"))
    assert.ok(pointGroup.length === 2, new Error("`pointGroup` should be a ['categoryName', points[]]"))

    const query = pointGroup[0]
    const points = pointGroup[1]
    const categoryId = pointTypesMap.get(query)

    if (!categoryId) {
      return console.warn("`pointGroup` with query", query, "has no defined categoryId")
    }

    assert.ok(Array.isArray(points), new Error("`points` should be an array"))

    points.forEach(function (point) {
      const name = point.title ? String(point.title).trim() : ""
      const useInfoWindow = point.useInfoWindow && point.useInfoWindow.content || ""
      const lat = point.position && point.position.lat ? Number(point.position.lat) : Number.NaN
      const lng = point.position && point.position.lng ? Number(point.position.lng) : Number.NaN
      const id = point.position && point.position.lat && point.position.lng ? `${point.position.lat}_${point.position.lng}` : null

      if (Number.isNaN(lat)) {
        return console.log("`point` has missed `lat`", point)
      }

      if (Number.isNaN(lng)) {
        return console.log("`point` has missed `lng`", point)
      }

      if (!id) {
        return console.warn("`point` has missed `id`", point)
      }

      if (name.length === 0) {
        return console.log("`point` cannot have empty `title`", point)
      }

      if (useInfoWindow.length === 0) {
        return console.log("`useInfoWindow` cannot be empty", point)
      }

      const html = HTMLParser.parse(useInfoWindow)
      const h3 = html.querySelector("h3")
      const heading = h3 ? h3.text.trim().replace(/\s\s+/g, ' ') : void 0
      const p = html.querySelectorAll("p")
      const address = p[0] ? p[0].text : heading

      if (!address) {
        console.log("`address` cannot be empty", point)
      }

      if (!parsedPoints.has(id)) {
        parsedPoints.set(id, {
          id,
          name,
          lat,
          lng,
          address,
          category_ids: [categoryId]
        })
      }
      else {
        const parsedPoint = parsedPoints.get(id)

        if (parsedPoint.name !== name) {
          console.warn("parsed point", id, "and next similar point have different names", parsedPoint.name, name)
        }

        parsedPoint.category_ids.push(categoryId)
      }
    })
  })

  const values = Array.from(parsedPoints.values())
  const data = JSON.stringify(values, null, 2)

  fs.writeFileSync(pointsParsedPath, data)
}

/**
 * Sync phrases from autocomplete
 */
async function syncPhrases() {
  const phrases = await fetchPhrases();
  const values = Array.from(phrases.values());
  const data = JSON.stringify(values, null, 2)

  fs.writeFileSync(__dirname + '/phrases.json', data)
}

/**
 * Sync phrases and it categories
 */
async function syncProducts() {
  const results = await saveSearchResults();
  const entries = Array.from(results.entries());
  const data = JSON.stringify(entries, null, 2);

  fs.writeFileSync(productsPath, data)
}

/**
 * Sync map points
 */
async function syncPoints() {
  const results = await fetchPoints();
  const entries = Array.from(results.entries());
  const data = JSON.stringify(entries, null, 2);

  fs.writeFileSync(pointsPath, data)
}

function parseCategories() {
  const names = new Set()
  const categories = []
  const products = require(productsPath)

  if (!Array.isArray(products)) {
    throw new Error("products should be an array")
  }

  // extract category names
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const [, types] = product

    if (!Array.isArray(types)) {
      continue
    }

    for (let j = 0; j < types.length; j++) {
      const type = types[j];
      const name = String(type.name).trim()

      names.add(name)
    }
  }

  // prepare categories
  for (const name of names) {
    categories.push({
      id: sha256(name).substr(0, 8).toUpperCase(),
      name: name
    })
  }

  const result = JSON.stringify(categories, null, 2)

  console.log("write result to", path.basename(categoriesPath))

  fs.writeFileSync(categoriesPath, result)
}

async function prepareWastes() {
  const categories = require(categoriesPath)
  const products = require(productsPath)
  const wastes = []
  const wastesBulk = []
  const categoryIdsMap = new Map()

  if (!Array.isArray(categories)) {
    throw new Error("`categories` should be an array")
  }

  // create map with `category-name` => `category-id`
  categories.forEach(function (category) {
    const name = category && category.name && category.name.pl
    const id = category && category.id

    if (!name) {
      return console.warn("`category`", category, "has empty name")
    }

    if (!id) {
      return console.warn("`category`", category, "has empty id")
    }

    categoryIdsMap.set(name, id)
  })

  if (!Array.isArray(products)) {
    throw new Error("`products` should be an array")
  }

  products.forEach(function (product) {
    if (!Array.isArray(product)) {
      return console.warn("`product`", product, "should be an array")
    }

    const name = String(product[0] || "").trim()
    const types = product[1]

    if (name.length === 0) {
      return console.warn("`name` of product", product, "should NOT be empty")
    }

    if (!Array.isArray(types)) {
      return console.warn("`types` of product", product, "should be an array")
    }

    const waste = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: {
        pl: name,
      },
      description: {
        pl: ""
      },
      categories: []
    }

    types.forEach(function (type) {
      const name = type.name

      if (!name) {
        return console.warn("`name` of product type", type, "cannot be empty")
      }

      const id = categoryIdsMap.get(name)

      if (!id) {
        return console.warn("cannot find id for", name)
      }

      waste.categories.push({
        id: id
      })
    })

    if (waste.categories.length === 0) {
      console.warn("`waste`", waste, "has empty categories")
    }

    wastes.push(waste)
    wastesBulk.push(JSON.stringify({ index: { "_index": "wastes", "_id": waste.id } }))
    wastesBulk.push(JSON.stringify(waste))
  })

  console.log("write result to", path.basename(wastesPath))

  fs.writeFileSync(wastesPath, JSON.stringify(wastes, null, 2))
  fs.writeFileSync(wastesCURLPath, wastesBulk.join("\n"))
}

function sha256(str) {
  const hash = crypto.createHash("sha256");

  hash.update(str)

  return hash.digest("hex")
}
