import { Client } from "@elastic/elasticsearch";

// TODO: split this interface
export interface AppState {
  title?: string;
  headerQuery?: string;
  description?: string;
  scripts?: string[];
  styles?: string[];
}

export interface AppContext {
  elastic: Client;
  i18n(phrase: string): string;
}

export interface Waste {
  $version: 1
  id: string
  name: string
  description: string
  categories: string[]
}

export interface WasteCategory {
  $version: 1
  id: string
  name: string
  uiColor?: string
  uiBackground?: string
}
