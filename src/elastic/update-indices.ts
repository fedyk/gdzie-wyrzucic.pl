import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, WASTE_CATEGORIES_INDEX } from "./constants"

async function updateIndices(client: Client) {
  const wasteIndexExists = await client.indices.exists({
    index: WASTES_INDEX
  })

  if (!wasteIndexExists.body) {
    await client.indices.create({
      index: WASTES_INDEX
    })
  }

  await client.indices.putMapping({
    index: WASTES_INDEX,
    body: {
      properties: {
        name: {
          type: "text"
        },
        description: {
          type: "text"
        }
      }
    }
  })

  const wasteCategoriesExists = await client.indices.exists({
    index: WASTE_CATEGORIES_INDEX
  })

  if (!wasteCategoriesExists.body) {
    await client.indices.create({
      index: WASTE_CATEGORIES_INDEX
    })
  }
}

if (!module.parent) {
  console.log("Updating indices...")

  updateIndices(new Client({ node: config.ELASTIC_SEARCH })).then(function() {
    console.log("Updating indices... done")
  }).catch(function(err) {
    console.log("Updating indices... error:")
    console.error(err)
  })
}
