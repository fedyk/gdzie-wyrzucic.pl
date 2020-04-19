import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, CATEGORIES_INDEX } from "./constants"

/** @see https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html */

const client = new Client({
  node: config.ELASTICSEARCH_URL
})

async function createMapping() {
  console.log("put mapping for", WASTES_INDEX)

  await client.indices.putMapping({
    index: WASTES_INDEX,
    body: {
      properties: {
        name: {
          properties: {
            en: {
              type: "text"
            },
            pl: {
              type: "text"
            },
            de: {
              type: "text"
            },
            ru: {
              type: "text"
            },
            ua: {
              type: "text"
            }
          }
        },
        description: {
          properties: {
            en: {
              type: "text"
            },
            pl: {
              type: "text"
            },
            de: {
              type: "text"
            },
            ru: {
              type: "text"
            },
            ua: {
              type: "text"
            }
          }
        },
        categories: {
          type: "nested",
          properties: {
            id: {
              type: "keyword"
            }
          }
        }
      }
    }
  })

  console.log("put mapping for", CATEGORIES_INDEX)

  await client.indices.putMapping({
    index: CATEGORIES_INDEX,
    body: {
      properties: {
        id: {
          type: "keyword"
        },
        name: {
          properties: {
            en: {
              type: "text"
            },
            pl: {
              type: "text"
            },
            de: {
              type: "text"
            },
            ru: {
              type: "text"
            },
            ua: {
              type: "text"
            }
          }
        },
        description: {
          properties: {
            en: {
              type: "text"
            },
            pl: {
              type: "text"
            },
            de: {
              type: "text"
            },
            ru: {
              type: "text"
            },
            ua: {
              type: "text"
            }
          }
        }
      }
    }
  })
}

createMapping().catch(err => console.error(err))