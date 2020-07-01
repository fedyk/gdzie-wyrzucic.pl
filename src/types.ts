import * as Koa from "koa"

export interface AppState {
  title?: string;
  headerQuery?: string;
  description?: string;
  scripts?: string[];
  styles?: string[];
}

export interface AppContext {
  i18n(phrase: string): string;
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
