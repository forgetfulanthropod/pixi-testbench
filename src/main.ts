import "./style.css"
import Testbench from "./TestBench"
import * as PIXI from "pixi.js"
// import { LoaderResource } from "pixi.js"

import backgroundUrl from "/images/cave-final.png"
import displacementMapUrl from "/images/displacement_map.png"
import lightMapUrl from "/images/lightmap.png"
import colorMapUrl from "/images/colormap.png"

import { bindFileDragNDrop } from "./bindFileDragNDrop"

//@ts-expect-error
window.PIXI = PIXI

const app = new Testbench()

export type Manifest = { name: string, url: string }[]

export const manifest: Manifest = [

    { name: "background", url: backgroundUrl },
    { name: "map", url: displacementMapUrl },
    { name: "lightmap", url: lightMapUrl },
    { name: "colormap", url: colorMapUrl },
]

const container = document.querySelector<HTMLElement>("#container")!
const dragHover = document.querySelector<HTMLDivElement>(".drag-enter")!

const reviveDragHover = bindFileDragNDrop(app, container, dragHover)

document.querySelector<HTMLElement>("#add-another")!.onclick = () => {
    console.log('reviving draghover..')
    reviveDragHover()
}