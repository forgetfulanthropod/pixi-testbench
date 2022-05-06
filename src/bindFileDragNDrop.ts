import type Testbench from "./TestBench"
import * as filters from "./filters"
// import { LoaderResource, Sprite } from "pixi.js"
import * as PIXI from "pixi.js"
import { manifest } from "./main"
import { Filter } from "pixi.js"
import { DisplayMeta } from "./TestBench"

import { loadZip } from "./loadZip"
import { center } from "./util"


export let screenHeight = 0 //document.getElementById('container').getBoundingClientRect().height

export let screenWidth = 0 //document.getElementById('container').getBoundingClientRect().width

export function bindFileDragNDrop(
    app: Testbench,
    container: HTMLElement,
    dragHover: HTMLDivElement
): () => void {

    screenHeight = container.getBoundingClientRect().height
    screenWidth = container.getBoundingClientRect().width

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

    dragHover.style.opacity = "1"

    dragHover.querySelector('input')!.oninput = async (e) => {
        console.log('input here, ', { e })
        e.preventDefault()

        dragHover.style.opacity = "0"

        const file = getFile(e)

        const isImage = ['png', 'jpg', 'jpeg'].includes(getExtension(file.name))

        if (isImage) {
            loadPng(file, app)
        }

        const isZip = getExtension(file.name) === 'zip'

        if (isZip) {
            loadZip(file, app)
        }

        if (!isImage && !isZip) {
            alert('must drop either an image or a .zip file.. ')
            throw new Error('not a zip or image!!')
        }

        dragHover.style.pointerEvents = 'none'
        dragHover.style.opacity = '0'

    }

    return function reviveDragHover() {
        dragHover.style.pointerEvents = 'auto'
        dragHover.style.opacity = '1'
    }
}

function getFile(e: Event): File {

    const files = (e.target as HTMLInputElement).files

    if (files == null || files.length !== 1) {
        alert("sorry, must drop one \n.png \nor \n.zip (from spine or aftereffects)")

        throw new Error("bad file drop?")
    }

    return files[0]
}

async function loadPng(file: File, app: Testbench) {
    const url = URL.createObjectURL(file)

    const sprite = PIXI.Sprite.from(url)

    app.filteredContainer.addChild(sprite)

    center(app, sprite)
    app.addNewImportControls({
        name: file.name,
        get(): DisplayMeta {
            return {
                x: sprite.x,
                y: sprite.y,
                scale: sprite.scale.x,
            }
        },
        set(d: DisplayMeta) {
            sprite.x = d.x
            sprite.y = d.y

            sprite.scale.set(d.scale, Math.abs(d.scale))
        },
        applyFilters(filters: Filter[]) {
            sprite.filters = filters
        },
    })
}

function getExtension(filename: string): string {
    return filename.split('.').at(-1)?.toLowerCase() ?? 'NONE'
}