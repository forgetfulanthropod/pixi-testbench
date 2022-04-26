import "./style.css"
import DemoApplication from "./DemoApplication"
import * as filters from "./filters"
import * as zip from "@zip.js/zip.js"
import * as PIXI from "pixi.js"
import { LoaderResource } from "pixi.js"

import backgroundUrl from "/images/cave-final.png"
import displacementMapUrl from "/images/displacement_map.png"
import lightMapUrl from "/images/lightmap.png"
import colorMapUrl from "/images/colormap.png"
// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// import './ga';

const container = document.querySelector<HTMLElement>("#container")!
const dragHover = document.querySelector<HTMLDivElement>(".drag-enter")!

const app = new DemoApplication()
const manifest = [
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

// Load resources then add filters
app.load(manifest, () => {
    for (const i in filters) {
        //@ts-expect-error
        filters[i].call(app)
    }
})

container.ondragover = (e) => {
    e.preventDefault() // necessary
}

container.ondragenter = (e) => {
    dragHover.style.opacity = "1"
}

container.ondragleave = (e) => {
    dragHover.style.opacity = "0"
}

// fileInput.onchange = () => console.log('dropped')
container.ondrop = async (e) => {
    e.preventDefault()

    dragHover.style.opacity = "0"

    const files = e.dataTransfer?.files

    if (files == null) throw new Error("no files!")

    if (files.length !== 1) {
        alert("sorry, must drop one .png or .zip")
        return
    }

    const file = files[0]
    console.log("file 0: ", file)

    const isPng = file.type === "image/png"

    if (isPng) {
        loadPng(file)
    }

    const isZip = file.type === "application/zip"

    if (isZip) {
        loadZip(file)
    }
}

// async  f(file: File) {
//     const image = new Image();
//     const fr = new FileReader();
//     fr.readAsDataURL(file);
//     const result = await new Promise(resolve => {fr.onload = e => resolve(e.target?.result)})
//     // const result = await waitForEvent(fr, 'load')
//     if (typeof result !== "string") {
//         console.error("file reader result is not string");
//         return;
//     }
//     image.src = result
//         image.onload = () => {
//             const loadTexture = new PIXI.Texture(new PIXI.BaseTexture(image));
//             const loadSprite = new PIXI.Sprite(loadTexture);
//           function  app.stage.addChild(loadSprite);
//         }
// }

async function f(file: File) {
    const image = new Image()
    const fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = (evt) => {
        image.src = evt.target.result
        image.onload = () => {
            const loadTexture = new PIXI.Texture(new PIXI.BaseTexture(image))
            const loadSprite = new PIXI.Sprite(loadTexture)
            app.stage.addChild(loadSprite)
        }
    }
}

async function loadPng(file: File) {
    app.loader.add(await file.arrayBuffer(), {
        xhrType: LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
    })
    app.loader.load(() => {
        console.log("loaded!!!!")
    })
}

async function loadZip(file: File) {
    const entries = await getEntries(file as Blob, {})
    console.log({ entries })

    // app.loadStaged(file)
}

function getEntries(file: Blob, options: zip.ZipReaderGetEntriesOptions) {
    return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options)
}
