import type DemoApplication from "./DemoApplication"
import * as filters from "./filters"
import * as zip from "@zip.js/zip.js"
// import { LoaderResource, Sprite } from "pixi.js"
import * as PIXI from "pixi.js"
import { manifest } from "./main"
import { Application, Sprite } from "pixi.js"
import { Spine, TextureAtlas } from "pixi-spine"
import { AtlasAttachmentLoader, Skeleton, SkeletonData, SkeletonJson } from "@pixi-spine/runtime-4.0"


export function bindFileDragNDrop(app: DemoApplication, container: HTMLElement, dragHover: HTMLDivElement) {

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

        const file = getFile(e)

        const isPng = file.type === "image/png"

        if (isPng) {
            loadPng(file, app)
        }

        const isZip = file.type === "application/zip"

        if (isZip) {
            loadZip(file, app)
        }
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

async function loadZip(file: File, app: Application) {
    const entries = await getEntries(file as Blob, {})
    console.log({ entries })

    const files: {name: string, url: string}[] = []
    
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

    app.loader.add(files)
    
    // files.forEach(file => app.loader.add(file.name, file.url))

    app.loader.load(async function (_loader, _resources) {
        const jsonFile = files.find(file => file.name.includes('.json'))!
        const atlasFile = files.find(file => file.name.includes('.atlas'))!

        console.log('about to parse data')
        console.log({
            skeletonJson: await fetch(jsonFile.url).then(r => r.json()), 
            atlasText: await fetch(atlasFile.url).then(r => r.text()), 
        })
        
        new Skeleton(new SkeletonData())
        const skel = new SkeletonJson(
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


        // console.log('parsed data', new TextureAtlas().addSpineAtlas(atlasFile.url))


        // const animation = new Spine()
        // const animation = new Spine((new SpineParser()).parseData(resources?.[jsonFile.name]).spineData)
        // const animation = new Spine(new TextureAtlas(new File(atlasFile.url).stream()).)
        const animation = new Spine(skel)
        app.stage.addChild(animation)
        app.start()
    })


        // add the animation to the scene and render...
    
    // if (animation.state.hasAnimation('run')) {
    //     // run forever, little boy!
    //     animation.state.setAnimation(0, 'run', true);
    //     // dont run too fast
    //     animation.state.timeScale = 0.1;
    // }
    

    // app.stage.addChild(spine)

    // app.loadStaged(file)
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