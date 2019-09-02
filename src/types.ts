import { Client } from "@elastic/elasticsearch";

// TODO: remove this interface
export interface AppState {
  title?: string;
  headerQuery?: string;
  description?: string;
  scripts?: string[];
  styles?: string[];
}

export interface AppContext {
  elasticClient: Client;
  i18n(phrase: string): string;
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
