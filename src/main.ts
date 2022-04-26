import "./style.css"
import DemoApplication from "./DemoApplication"
import * as PIXI from "pixi.js"
// import { LoaderResource } from "pixi.js"

import backgroundUrl from "/images/cave-final.png"
import displacementMapUrl from "/images/displacement_map.png"
import lightMapUrl from "/images/lightmap.png"
import colorMapUrl from "/images/colormap.png"

import { bindFileDragging } from "./bindFileDragging"

//@ts-expect-error
window.PIXI = PIXI
// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// import './ga';

const app = new DemoApplication()

export const manifest = [

    { name: "background", url: backgroundUrl },
    { name: "map", url: displacementMapUrl },
    { name: "lightmap", url: lightMapUrl },
    { name: "colormap", url: colorMapUrl },
]

const container = document.querySelector<HTMLElement>("#container")!
const dragHover = document.querySelector<HTMLDivElement>(".drag-enter")!

bindFileDragging(app, container, dragHover)
