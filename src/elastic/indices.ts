import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, CATEGORIES_INDEX } from "./constants"

const client = new Client({
  node: config.ELASTICSEARCH_URL
})

async function createIndices() {
  await client.indices.create({
    index: WASTES_INDEX
  }).catch(err => console.error(WASTES_INDEX, err))
  
  await client.indices.create({
    index: CATEGORIES_INDEX
  }).catch(err => console.error(CATEGORIES_INDEX, err))
}

createIndices()
