import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, CATEGORIES_INDEX, POINTS_INDEX } from "./constants"

const client = new Client({
  node: config.ELASTICSEARCH_URL
})

createIndices().catch(err => console.error(err))

async function createIndices() {
  console.log("Creating index", WASTES_INDEX)

  await client.indices.create({
    index: WASTES_INDEX
  })
  
  console.log("Creating index", CATEGORIES_INDEX)

  await client.indices.create({
    index: CATEGORIES_INDEX
  })
  
  console.log("Creating index", CATEGORIES_INDEX)

  await client.indices.create({
    index: POINTS_INDEX
  })
}
