import type Testbench from "./TestBench"
import * as filters from "./filters"
import * as zip from "@zip.js/zip.js"
// import { LoaderResource, Sprite } from "pixi.js"
import * as PIXI from "pixi.js"
import { manifest } from "./main"
import { BaseTexture, Filter, Sprite } from "pixi.js"
import { Spine, TextureAtlas } from "pixi-spine"
import { AtlasAttachmentLoader, Skeleton, SkeletonData, SkeletonJson } from "@pixi-spine/runtime-4.0"
import { DisplayMeta } from "./TestBench"


import { AEDataInterceptor, AEDataLoader, AfterEffects } from 'pixi6-after-effects/src'


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

type FileNamesAndUrls = { name: string, url: string }[]

async function loadZip(file: File, app: Testbench) {
    const entries = await getEntries(file as Blob, {})
    console.log({ entries })

    const files: FileNamesAndUrls = []

    await Promise.all(
        entries.filter(entry =>
            !entry.filename.includes('__MACOSX')
        )
            .map(async entry => {
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
                )

                const nameParts = entry.filename.split('/')
                const filename = nameParts.length > 1 ? nameParts.slice(1).join('/') : entry.filename
                console.log({ filename })
                files.push({ name: filename, url: blobURL })
            })
    )

    const spineOnlyFile = files.find(file => file.name.includes('.atlas'))!
    if (spineOnlyFile != null)
        await loadSpineFiles(files, app)
    else {
        await loadAfterEffectsFiles(files, app)
    }
}

async function loadSpineFiles(files: FileNamesAndUrls, app: Testbench) {
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

                    loaderFunction(BaseTexture.from(imageUrl))
                }
            )
        )
    ).readSkeletonData(
        await fetch(jsonFile.url).then(r => r.json())
    )

    console.log(skeleton)

    const animation = new Spine(skeleton)

    animation.scale.set(.5)

    if (animation.height > screenHeight * .9) animation.scale.set(screenHeight / animation.height * .6 * .5)
    const bounds = animation.getBounds()

    if (bounds.left < -50) animation.x = -bounds.left + (screenWidth - animation.width) / 2
    if (bounds.top < -50) animation.y = -bounds.top + (screenHeight - animation.height) / 2

    animation.state.setAnimation(0, skeleton.animations[0].name, true)

    let animationIndex = 0
    toggleAnimation()

        ; app.filteredContainer.addChild(animation)

    animation.cursor = 'pointer'
    animation.interactive = true
    animation.on('pointerdown', () => {
        toggleAnimation()
    })

    app.addNewImportControls({
        name: jsonFile.name,
        get(): DisplayMeta {
            return {
                x: animation.x,
                y: animation.y,
                scale: animation.scale.x,
            }
        },
        set(d: DisplayMeta) {
            animation.x = d.x
            animation.y = d.y

            animation.scale.set(d.scale, Math.abs(d.scale))
        },
        applyFilters(filters: Filter[]) {
            animation.filters = filters
        }
    })

    // app.start()

    function toggleAnimation() {
        console.log('toggling animation', { animationIndex })
        if (animationIndex >= skeleton.animations.length) animationIndex = 0

        animation.state.setAnimation(0, skeleton.animations[animationIndex].name, true)

        animationIndex++
    }

}

type AEClick = { target: AfterEffects }

async function loadAfterEffectsFiles(files: FileNamesAndUrls, app: Testbench) {
    const jsonFile = files.find(file => file.name.includes('.json'))!


    // const interceptor = new AEDataInterceptor({
    //     '00': {
    //         //B
    //         outPoint: 103,
    //         events: {
    //             click: ({ target }: AEClick) => {
    //                 target
    //                 target.play(false)
    //             }
    //         }
    //     },
    //     '0': {
    //         //O
    //         outPoint: 103,
    //         events: {
    //             click: ({ target }: AEClick) => {
    //                 target.play(true)
    //             }
    //         }
    //     },
    //     D: {
    //         outPoint: 103,
    //         events: {
    //             click: ({ target }: AEClick) => {
    //                 target.play(false)
    //             },
    //             completed: () => {
    //                 console.log('completed D')
    //             }
    //         }
    //     }
    // })

    const loader = new AEDataLoader()

    loader.imageTextureProxy = (path) => {
        return Sprite.from(path).texture
    }

    loader.imagePathProxy = (path) => {
        files.forEach(file => { console.log({ fileName: file.name, path }) })
        const file = files.find(file => path.includes(file.name))

        if (file == null) throw new Error(`"${path}" didn't seem to be in the zip...`)

        return file.url
        // return BaseTexture.from(file.url)
    }
    // loader.loadJSONWithInterceptor(jsonFile.url, interceptor).then(
    debugger
    loader.loadJSON(jsonFile.url).then(
        (data) => {
            console.log({ data })

            if (data == null) throw new Error('null data :/')

            const ae = AfterEffects.fromData(data, {})
            ae.scale.set(1)
            ae.on('completed', (o) => {
                console.log('completed!', o)
            })
            app.filteredContainer.addChild(ae)
            ae.play(true)

            PIXI.Ticker.shared.add((_dt) => {
                ae.update(Date.now())
            })

            app.addNewImportControls({
                name: jsonFile.name,
                get(): DisplayMeta {
                    return {
                        x: ae.x,
                        y: ae.y,
                        scale: ae.scale.x,
                    }
                },
                set(d: DisplayMeta) {
                    ae.x = d.x
                    ae.y = d.y

                    ae.scale.set(d.scale, Math.abs(d.scale))
                },
                applyFilters(filters: Filter[]) {
                    ae.filters = filters
                }
            })
        },
        (err) => {
            console.error('load error', err)
        }
    )
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

function getExtension(filename: string): string {
    return filename.split('.').at(-1)?.toLowerCase() ?? 'NONE'
}