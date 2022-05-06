import Testbench from "./TestBench"
import * as PIXI from "pixi.js"
import { Filter, Sprite } from "pixi.js"
import { DisplayMeta } from "./TestBench"
import { AEDataLoader, AfterEffects } from 'pixi6-after-effects'
import { FileNamesAndUrls } from "./loadZip"
import { center } from "./util"
// import { FileNamesAndUrls } from "./bindFileDragNDrop"

// type AEClick = { target: AfterEffects }
export async function loadAfterEffectsFiles(files: FileNamesAndUrls, app: Testbench) {
    const jsonFile = files.find(file => file.name.includes('.json'))!


    // todo: autodetect?
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

    loader.imagePathProxy = (path) => {
        files.forEach(file => { console.log({ fileName: file.name, path }) })
        const file = files.find(file => path.includes(file.name))

        if (file == null)
            throw new Error(`"${path}" didn't seem to be in the zip...`)

        return file.url
    }

    loader.imageTextureProxy = (path) => {
        return Sprite.from(path).texture
    }

    // loader.loadJSONWithInterceptor(jsonFile.url, interceptor).then(
    loader.loadJSON(jsonFile.url).then(
        (data) => {
            console.log({ data })

            if (data == null)
                throw new Error('null data :/')

            let ae = getAE()

            center(app, ae)
            app.addNewImportControls({
                name: jsonFile.name,
                get(): DisplayMeta {
                    return {
                        x: ae.x,
                        y: ae.y,
                        scale: ae.scale.x,
                        animationSpeed: ae.frameRate / app.ticker.FPS
                    }
                },
                set(d: DisplayMeta) {
                    if (d.animationSpeed) {
                        ae.parent.removeChild(ae)
                        const frameRate = d.animationSpeed * app.ticker.FPS
                        // console.log(`new AE with framerate: ${frameRate}`)
                        ae = getAE(frameRate)
                    }

                    ae.x = d.x
                    ae.y = d.y

                    ae.scale.set(d.scale, Math.abs(d.scale))

                },
                applyFilters(filters: Filter[]) {
                    ae.filters = filters
                }
            })

            function getAE(frameRate?: number) {
                const ae = AfterEffects.fromData({ ...data, ...frameRate ? { fr: frameRate } : {} }, {})
                ae.scale.set(1)

                app.filteredContainer.addChild(ae)
                ae.play(true)

                PIXI.Ticker.shared.add((_dt) => {
                    ae.update(Date.now())
                })

                return ae
            }
        },
        (err) => {
            console.error('load error', err)
        }
    )
}
