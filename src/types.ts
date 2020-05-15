import * as Koa from "koa"
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
  name: {
    en: string,
    de: string,
    pl: string,
    ua: string,
    ru: string
  }
  description: {
    en: string,
    de: string,
    pl: string,
    ua: string,
    ru: string
  }
  categories: {
    id: string
  }[]
}

export interface Category {
  $version: 1
  id: string
  name: {
    en: string,
    de: string,
    pl: string,
    ua: string,
    ru: string
  }
  uiColor?: string
  uiBackground?: string
}

export interface MapPoint {
  id: string
  name: string
  lat: number
  lng: number
  categoryNames: string[]
  formattedOpeningHours: string
  websiteUrl: string
}



export type Middleware = Koa.Middleware<AppState, AppContext>

export interface Waste2 {
  id: string
  name: string,
  categoryIds: string[]
}

export interface Category2 {
  id: string
  name: string,
}

export interface Point {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  categoryIds: string[]
}
