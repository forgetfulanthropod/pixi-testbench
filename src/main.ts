import "./style.css"
import DemoApplication from "./DemoApplication"
import * as PIXI from "pixi.js"
// import { LoaderResource } from "pixi.js"

import backgroundUrl from "/images/cave-final.png"
import displacementMapUrl from "/images/displacement_map.png"
import lightMapUrl from "/images/lightmap.png"
import colorMapUrl from "/images/colormap.png"
import { Application, Loader, Texture } from "pixi.js"
import { bindFileDragging } from "./bindFileDragging"


window.PIXI = PIXI
// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// import './ga';

const app = new DemoApplication()

export const manifest = [
    // { name: 'background', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // // { name: 'background', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // { name: 'overlay', url: 'images/overlay.png' },
    // { name: 'map', url: 'images/displacement_map.png' },
    // { name: 'fish1', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // { name: 'fish2', url: '/FrogWizard-cropped-200-OJOSIGV5.png' },
    // { name: 'fish3', url: '/Gnome_hooligan-200-NRGJZ24H.png' },
    // { name: 'fish4', url: '/green_jester-200-475SHUVH.png' },
    // { name: 'lightmap', url: 'images/lightmap.png' },
    // { name: 'colormap', url: 'images/colormap.png' },

    // { name: 'overlay', url: 'images/overlay.png' },
    // { name: 'fish1', url: 'images/displacement_fish1.png' },
    // { name: 'fish2', url: 'images/displacement_fish2.png' },
    // { name: 'fish3', url: 'images/displacement_fish3.png' },
    // { name: 'fish4', url: 'images/displacement_fish4.png' },

    { name: "background", url: backgroundUrl },
    { name: "map", url: displacementMapUrl },
    { name: "lightmap", url: lightMapUrl },
    { name: "colormap", url: colorMapUrl },
]

const container = document.querySelector<HTMLElement>("#container")!
const dragHover = document.querySelector<HTMLDivElement>(".drag-enter")!

bindFileDragging(app, container, dragHover)
