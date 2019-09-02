const fs = require("fs")
const url = require("url")
const https = require("https")
const HTMLParser = require("node-html-parser")
const querystring = require("querystring")
const cachedPhrases = require('./phrases.json');
const [,,action] = process.argv;

const help = `
Usage: node index.js <action>

node index.js sync-phrases    fetch and save autocomplete results to file 'phases.json'
node index.js sync-products   fetch and save pharse search results to 'items.json'
node index.js sync-points     fetch and save map points to 'points.json'
`

switch (action) {
  case "sync-phrases":
    return syncPhrases();

  case "sync-products":
    return syncProducts();

  case "sync-points":
    return syncPoints()

  default:
    console.log(help)
}

function get(url) {
  return new Promise(function(resolve, reject) {
    https.get(url, function(resp) {
      let data = '';

      resp.on('data', function(chunk) {
        data += chunk
      })

      resp.on('end', function() {
        resolve(data)
      });
    }).on("error", function(error) {
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

  return new Promise(function(resolve, reject) {
    const request = https.request(options, function(resp) {
      let data = '';

      resp.on('data', function(chunk) {
        data += chunk
      })

      resp.on('end', function() {
        resolve(data)
      })
    })

    request.on("error", function(error) {
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

      const links = categoryEl.querySelectorAll('a').map(function(anchor) {
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
    const markers = parsedResp && parsedResp.markers.map(function(marker) {
      const { useInfoWindow } = marker
      const windowContent = useInfoWindow && useInfoWindow.content || "";

//       if (windowContent) {

//       }
//       useInfoWindow
// content
      return marker;

    })

    results.set(pointsType, markers);
  }
  
  return results;
}

async function syncPhrases() {
  const phrases = await fetchPhrases();
  const values = Array.from(phrases.values());
  const data = JSON.stringify(values, null, 2)

  fs.writeFileSync(__dirname + '/phrases.json', data)
}

async function syncProducts() {
  const results = await saveSearchResults();
  const entries = Array.from(results.entries());
  const data = JSON.stringify(entries, null, 2);

  fs.writeFileSync(__dirname + '/items.json', data)
}

async function syncPoints() {
  const results = await fetchPoints();
  const entries = Array.from(results.entries());
  const data = JSON.stringify(entries, null, 2);

  fs.writeFileSync(__dirname + '/points.json', data)
}