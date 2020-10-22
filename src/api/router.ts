import Router from "koa-router";
import { IState, Context } from "../types";
import { listCategories } from "./list-categories"
import { createCategory } from "./create-category"
import { listWastes } from "./list-wastes"

export const router = new Router<IState, Context>();

router.all("/api/v1.0/list_categories", listCategories)
router.all("/api/v1.0/create_category", createCategory)
router.all("/api/v1.0/update_category", noop)
router.all("/api/v1.0/delete_category", noop)

router.all("/api/v1.0/list_wastes", listWastes)
router.all("/api/v1.0/search_wastes", noop)
router.all("/api/v1.0/create_waste", noop)
router.all("/api/v1.0/update_waste", noop)
router.all("/api/v1.0/delete_waste", noop)


router.all("/api/v1.0/list_points", noop)
router.all("/api/v1.0/create_point", noop)
router.all("/api/v1.0/update_point", noop)
router.all("/api/v1.0/delete_point", noop)

function noop() {
  throw new Error("Not implemented")
}
