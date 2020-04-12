import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, CATEGORIES_INDEX } from "./constants"

/** @see https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html */

const client = new Client({
  node: config.ELASTICSEARCH_URL
})

async function createMapping() {
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

  await client.indices.putMapping({
    index: CATEGORIES_INDEX,
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
}

createMapping().catch(err => console.error(err))