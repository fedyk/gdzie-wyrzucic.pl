import { Client, RequestParams } from "@elastic/elasticsearch";
import { Waste } from "./types";

interface SearchHits<T> {
  _index: string
  _type: string
  _id: string
  _score: number
  _source: T;
}

export async function searchWaste(client: Client, query: string): Promise<SearchHits<Waste>[]> {
  const search: RequestParams.Search = {
    index: "waste",
    body: {
      query: {
        match: { name: query }
      }
    }
  };

  const { body } = await client.search(search)

  // 'body'  =>  array(
  //   'query' =>  array(
  //     'multi_match' => array(
  //       'type'          =>  'most_fields',
  //       'operator'      =>  'and',
  //       'query'         =>  trim($query),
  //       'fuzziness'     =>  2,
  //       'prefix_length' =>  3,
  //       'fields'        =>  array(
  //         'name',
  //         'description'
  //       )
  //     )
  //   ),

  return body.hits.hits;
}

const client = new Client({
  node: 'https://pirsy28nf4:xjodxqhk7r@birch-121586807.eu-west-1.bonsaisearch.net:443'
})

async function indexSetup() {
  const waste1: RequestParams.Index<Waste> = {
    index: "waste",
    body: {
      $version: 1,
      name: "papier",
      description: "",
      categories: [{
        $version: 1,
        categoryId: "1",
        categoryName: "papier",
        categoryColor: "blue",
      }]
    }
  }
  
  const waste2: RequestParams.Index<Waste> = {
    index: "waste",
    body: {
      $version: 1,
      name: "check desc",
      description: "test",
      categories: [{
        $version: 1,
        categoryId: "1",
        categoryName: "test",
        categoryColor: "blue",
      }, {
        $version: 1,
        categoryId: "2",
        categoryName: "test2",
        categoryColor: "yellow",
      }]
    }
  }
  
  const waste3: RequestParams.Index<Waste> = {
    index: "waste",
    body: {
      $version: 1,
      name: "test waste",
      description: "",
      categories: [{
        $version: 1,
        categoryId: "1",
        categoryName: "test",
        categoryColor: "blue",
      }, {
        $version: 1,
        categoryId: "2",
        categoryName: "test2",
        categoryColor: "yellow",
      }]
    }
  }

  const wasteIndex: RequestParams.IndicesCreate = {
    index: "waste"
  }

  const wasteIndexMapping: RequestParams.IndicesPutMapping = {
    index: "waste",
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
  }

  await client.indices.delete({
    index: "waste",
    ignore_unavailable: true
  });

  await client.indices.create(wasteIndex)

  await client.indices.putMapping(wasteIndexMapping)

  // Let's start by indexing some data
  await client.index(waste1)
  await client.index(waste2)
  await client.index(waste3)

  // get any result in the consequent search
  await client.indices.refresh({ index: 'waste' })
}

async function searchIndex() {
  // Let's search!
  const { body } = await client.search({
    index: "waste",
    // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    body: {
      query: {
        match: { name: 'test' }
      }
    }
  })

  console.log(body.hits.hits)
}

// searchIndex().catch(err => {
//   debugger
//   console.error(err)
// })

// indexSetup().catch(err => {
//   debugger
//   console.error(err)
// })
