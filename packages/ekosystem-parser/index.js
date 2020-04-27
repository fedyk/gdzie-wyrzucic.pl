const fs = require("fs")
const url = require("url")
const https = require("https")
const path = require("path")
const HTMLParser = require("node-html-parser")
const querystring = require("querystring")
const cachedPhrases = require('./phrases.json');
const productsPath = path.resolve(__dirname, "products.json")
const categoriesPath = path.resolve(__dirname, "categories.json")
const wastesPath = path.resolve(__dirname, "wastes.json")
const wastesCURLPath = path.resolve(__dirname, "wastes.curl")
const [, , action] = process.argv;

const help = `
Usage: node index.js <action>

node index.js sync-phrases         fetch and save autocomplete results to file 'phases.json'
node index.js sync-products        fetch and save phrase search results to 'products.json'
node index.js sync-points          fetch and save map points to 'points.json'
node index.js prepare-categories   extract categories from products
node index.js prepare-wastes       extract wastes to PUT in ES
`

switch (action) {
  case "sync-phrases":
    return syncPhrases();

  case "sync-products":
    return syncProducts();

  case "sync-points":
    return syncPoints()

  case "prepare-categories":
    return prepareCategories()

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
  const pointsTypes = require('./points-types.json');
  const url = `https://mapa.ekosystem.wroc.pl/admin/admin-ajax.php`
  const results = new Map();

  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < pointsTypes.length; i++) {
    const pointsType = pointsTypes[i];
    const resp = await post(url, {
      action: "get-points",
      "points[]": pointsType
    })
    const parsedResp = JSON.parse(resp);
    const markers = parsedResp ? parsedResp.markers : void 0

    if (!Array.isArray(markers)) {
      console.warn(pointsType, "has no markets")
    }
    else {
      results.set(pointsType, markers);
    }
  }

  return results;
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

  fs.writeFileSync(__dirname + '/points.json', data)
}

function prepareCategories() {
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

      names.add(type.name)
    }
  }

  // prepare categories
  for (const name of names) {
    categories.push({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: {
        pl: name
      }
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
  categories.forEach(function(category) {
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

  products.forEach(function(product) {
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

    types.forEach(function(type) {
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
    wastesBulk.push(JSON.stringify({ index : { "_index" : "wastes", "_id" : waste.id } }))
    wastesBulk.push(JSON.stringify(waste))
  })

  console.log("write result to", path.basename(wastesPath))

  fs.writeFileSync(wastesPath, JSON.stringify(wastes, null, 2))
  fs.writeFileSync(wastesCURLPath, wastesBulk.join("\n"))
}