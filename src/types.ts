import { Client } from "@elastic/elasticsearch";

export interface AppState {
  title?: string;
  description?: string;
  scripts?: string[];
  styles?: string[];
}

export interface AppContext {
  elasticClient: Client;
}


export interface Waste {
  $version: 1
  name: string
  description: string
  categories: WasteCategory[]
}

export interface WasteCategory {
  $version: 1
  categoryId: string
  categoryName: string
  categoryColor: string
}
