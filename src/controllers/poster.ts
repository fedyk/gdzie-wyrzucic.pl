const { createCanvas, loadImage, registerFont } = require('canvas')
import * as path from "path"
import * as querystring from "querystring"
import { Middleware } from "../types"
import { renderView } from "../views"
import { getWastesIds, getCategoriesIds, getWastesById } from "../storage"

export const poster: Middleware = async (ctx) => {
  const wasteId = ctx.params.wasteId

  if (!wasteId) {
    return ctx.throw(new Error("`wasteId` can't be empty"), 404)
  }

  const waste = getWastesById(wasteId)

  if (!waste) {
    return ctx.throw(new Error("can't find waste"), 404)
  }

  // register fort
  registerFont("assets/Comfortaa/static/Comfortaa-Medium.ttf", {
    family: "Comfortaa Medium"
  })

  const WIDTH = 2400
  const HEIGHT = 1254
  const PADDING = 50
  const canvas = createCanvas(WIDTH, HEIGHT)
  const context = canvas.getContext("2d")

  // scale for retina support
  context.scale(2, 2)

  // background
  context.fillStyle = "#000"
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // waste name


  const title = waste.name



  // add title

  // Write "Awesome!"
  context.fillStyle = "#fff"
  context.textAlign = "left"
  context.textBaseline = "alphabetic"
  context.font = '48px "Comfortaa Medium"'
  context.fillText(waste.name, PADDING, PADDING + 48, WIDTH - 2 * PADDING)

  // Draw line under text
  // var text = context.measureText(waste.name)
  // context.strokeStyle = 'rgba(0,255,0,0.5)'
  // context.beginPath()
  // context.lineTo(50, 102)
  // context.lineTo(50 + text.width, 102)
  // context.stroke()

  ctx.response.headers["Content-Type"] = "image/png"
  ctx.body = canvas.createPNGStream()
}

