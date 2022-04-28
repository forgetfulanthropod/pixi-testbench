import type DemoApplication from "./DemoApplication"
import * as filters from "./filters"
import * as zip from "@zip.js/zip.js"
// import { LoaderResource, Sprite } from "pixi.js"
import * as PIXI from "pixi.js"
import { manifest } from "./main"
import { Application, Container, Sprite } from "pixi.js"
import { Spine, TextureAtlas } from "pixi-spine"
import { AtlasAttachmentLoader, Skeleton, SkeletonData, SkeletonJson } from "@pixi-spine/runtime-4.0"



let screenHeight = 0 //document.getElementById('container').getBoundingClientRect().height

let screenWidth = 0 //document.getElementById('container').getBoundingClientRect().width

export function bindFileDragNDrop(
    app: DemoApplication, 
    container: HTMLElement, 
    dragHover: HTMLDivElement
) : () => void {

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

    // container.ondragenter = () => {
    //     dragHover.style.opacity = "1"
    // }

    // container.ondragleave = () => {
    //     dragHover.style.opacity = "0"
    // }

    // container.onclick = () => true
    // container.onpointerenter = () => true
    // container.onpointerleave = () => true

    // fileInput.onchange = () => console.log('dropped')
    dragHover.ondrop = async (e) => {
        e.preventDefault()

        dragHover.style.opacity = "0"

        const file = getFile(e)

        const isPng = file.type === "image/png"

        if (isPng) {
            loadPng(file, app)
        }

        const isZip = file.type === "application/zip"

        if (isZip) {
            loadZip(file, app)
        }

        dragHover.style.pointerEvents = 'none'
        dragHover.style.opacity = '0'
    }

    return function reviveDragHover() {
        dragHover.style.pointerEvents = 'auto'
        dragHover.style.opacity = '1'
    }
}

function getFile(e: DragEvent): File {
    const files = e.dataTransfer?.files

    if (files == null || files.length !== 1) {
        alert("sorry, must drop one \n.png \nor \n.zip (from spine or aftereffects)")
        
        throw new Error("bad file drop?")
    }

    return files[0]
}

async function loadPng(file: File, app: Application) {
    const url = URL.createObjectURL(file)
    
    const loadSprite = PIXI.Sprite.from(url)

    app.stage.addChild(loadSprite)
}

type FileNamesAndUrls = {name: string, url: string}[]

async function loadZip(file: File, app: Application) {
    const entries = await getEntries(file as Blob, {})
    console.log({ entries })

    const files: FileNamesAndUrls = []
    
    await Promise.all(
        entries.map(async entry => {
            if (entry == null) return

            const blobURL = await getURL(entry, 
                // {
                //     password: passwordInput.value,
                //     onprogress: (index, max) => {
                //         unzipProgress.value = index;
                //         unzipProgress.max = max;
                //     },
                //     signal
                // }
            );

            files.push({name: entry.filename, url: blobURL})
        })
    )

    const spineOnlyFile = files.find(file => file.name.includes('.atlas'))!
    if (spineOnlyFile != null)
        await loadSpineFiles(files, app)
}

async function loadSpineFiles(files: FileNamesAndUrls, app: Application) {
    const jsonFile = files.find(file => file.name.includes('.json'))!
    const atlasFile = files.find(file => file.name.includes('.atlas'))!

    console.log('about to parse data')
    console.log({
        skeletonJson: await fetch(jsonFile.url).then(r => r.json()), 
        atlasText: await fetch(atlasFile.url).then(r => r.text()), 
    })
    
    new Skeleton(new SkeletonData())
    const skeleton = new SkeletonJson(
        new AtlasAttachmentLoader(
            new TextureAtlas(
                await fetch(atlasFile.url).then(r => r.text()),
                (path, loaderFunction) => {

                    const imageUrl = files.find(file => file.name === path)!.url

                    loaderFunction(Sprite.from(imageUrl).texture.baseTexture)
                }
            )
        )
    ).readSkeletonData(
        await fetch(jsonFile.url).then(r => r.json())
    )

    console.log(skeleton)

    const animation = new Spine(skeleton)

    animation.scale.set(.5)

    console.log({animationHeight: animation.height, screenHeight})
    
    if(animation.height > screenHeight * .9) animation.scale.set(screenHeight /  animation.height * .6 * .5)
    const bounds = animation.getBounds()

    if (bounds.left < -50) animation.x = -bounds.left + (screenWidth - animation.width) / 2
    if (bounds.top < -50) animation.y = -bounds.top + (screenHeight - animation.height) / 2
    
    animation.state.setAnimation(0, skeleton.animations[0].name, true)

    let animationIndex = 0
    toggleAnimation()

    ;(app.stage.children[0] as Container).addChild(animation)
    
    animation.cursor = 'pointer'
    animation.interactive = true
    animation.on('pointerdown', () => {
        toggleAnimation()
    })
    
    // app.start()

    function toggleAnimation() {
        console.log('toggling animation', {animationIndex})
        if (animationIndex >= skeleton.animations.length) animationIndex = 0

        animation.state.setAnimation(0, skeleton.animations[animationIndex].name, true)
        
        animationIndex++
    }
    
}

async function getURL(entry: zip.Entry, options = {}) {
    return URL.createObjectURL(
        //@ts-expect-error
        await entry.getData(
            new zip.BlobWriter(), 
            options
        )
    )
}

function getEntries(file: Blob, options: zip.ZipReaderGetEntriesOptions): Promise<zip.Entry[]> {
    return new zip.ZipReader(new zip.BlobReader(file)).getEntries(options)
}