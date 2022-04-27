import type DemoApplication from "./DemoApplication"
import * as filters from "./filters"
import * as zip from "@zip.js/zip.js"
// import { LoaderResource, Sprite } from "pixi.js"
import * as PIXI from "pixi.js"
import { manifest } from "./main"

export function bindFileDragging(app: DemoApplication, container: HTMLElement, dragHover: HTMLDivElement) {

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

    container.ondragenter = () => {
        dragHover.style.opacity = "1"
    }

    container.ondragleave = () => {
        dragHover.style.opacity = "0"
    }

    // fileInput.onchange = () => console.log('dropped')
    container.ondrop = async (e) => {
        e.preventDefault()

        dragHover.style.opacity = "0"

        const files = e.dataTransfer?.files

        if (files == null)
            throw new Error("no files!")

        if (files.length !== 1) {
            alert("sorry, must drop one \n.png \nor \n.zip (from spine or aftereffects)")
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

    async function loadPng(file: File) {
        const url = URL.createObjectURL(file)
        
        const loadSprite = PIXI.Sprite.from(url)

        app.stage.addChild(loadSprite)
    }

    async function loadZip(file: File) {
        const entries = await getEntries(file as Blob, {})
        console.log({ entries })

        // app.loadStaged(file)
    }

    function getEntries(file: Blob, options: zip.ZipReaderGetEntriesOptions) {
        return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options)
    }

}
