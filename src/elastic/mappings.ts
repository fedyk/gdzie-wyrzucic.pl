import { Client } from "@elastic/elasticsearch"
import { config } from "../config"
import { WASTES_INDEX, CATEGORIES_INDEX, POINTS_INDEX } from "./constants"

/** @see https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html */

createMapping().catch(err => console.error(err))

async function createMapping() {
  const client = new Client({
    node: config.ELASTICSEARCH_URL
  })

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

  console.log("put mapping for", POINTS_INDEX)

  await client.indices.putMapping({
    index: POINTS_INDEX,
    body: {
      properties: {
        id: {
          type: "keyword"
        },
        name: {
          properties: {
            en: {
              type: "keyword"
            },
            pl: {
              type: "keyword"
            },
            de: {
              type: "keyword"
            },
            ru: {
              type: "keyword"
            },
            ua: {
              type: "keyword"
            }
          }
        },
        description: {
          properties: {
            en: {
              type: "keyword"
            },
            pl: {
              type: "keyword"
            },
            de: {
              type: "keyword"
            },
            ru: {
              type: "keyword"
            },
            ua: {
              type: "keyword"
            }
          }
        },
        lat: {
          type: "float"
        },
        lng: {
          type: "float"
        },
        categories: {
          type: "nested",
          properties: {
            id: {
              type: "keyword"
            }
          }
        },
        formatted_opening_hours: {
          type: "keyword"
        },
        website_url: {
          type: "keyword"
        }
      }
    }
  })
}
