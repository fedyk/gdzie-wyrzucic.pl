const fs = require("fs")
const path = require("path")
const https = require("https")
const crypto = require("crypto")
const pointsPath = path.resolve(__dirname, "points.json")
const [, , action] = process.argv;

const help = `
Usage: node index.js <action>

node index.js sync                  fetch and save information about H&M stores'
`

switch (action) {
  case "sync":
    return sync().catch(err => console.error(err))

  default:
    console.log(help)
}

async function sync() {
  const response = await get("https://api.storelocator.hmgroup.tech/v2/brand/hm/stores/locale/pl_PL/country/PL?_type=json&campaigns=true&departments=true&openinghours=true&maxnumberofstores=100")
  const stores = JSON.parse(response)

  if (stores && stores.stores && !Array.isArray(stores.stores)) {
    throw new RangeError("`stores.stores` should be an array")
  }

  const points = parsePoints(stores.stores).map(point => {
    /** add H&M category */
    point.categoryIds = ["3e1f50db"]

    return point
  })


  const data = JSON.stringify(points, null, 2)

  fs.writeFileSync(pointsPath, data)

  console.log("write result to", path.basename(pointsPath))
}

function get(url) {
  return new Promise(function (resolve, reject) {
    https
      .get(url, function (resp) {
        let data = "";

        resp.on("data", chunk => data += chunk)
        resp.on("end", () => resolve(data));
      })
      .on("error", err => reject(err))
  })
}

function parsePoints(points) {
  return points.map(p => parsePoint(p))
}

function parsePoint(point) {
  if (!point) {
    throw new RangeError("`point` cannot be empty")
  }

  const lat = Number(point.latitude)

  if (Number.isNaN(lat)) {
    throw new RangeError("`lat` should be valid number")
  }

  const lng = Number(point.longitude)

  if (Number.isNaN(lng)) {
    throw new RangeError("`lng` should be valid number")
  }

  const id = sha256(`${lat}_${lng}`).substr(0, 8).toUpperCase()
  const name = `H&M, ${point.name}`
  const address = point.address.streetName2 + ", " + point.address.postCode + ", " + point.address.postalAddress

  return {
    id: id,
    name: name,
    lat: lat,
    lng: lng,
    address: address,
  }
}

function sha256(str) {
  const hash = crypto.createHash("sha256");

  hash.update(str)

  return hash.digest("hex")
}
