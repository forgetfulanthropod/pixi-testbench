import Testbench from "./TestBench"
import { BaseTexture, Filter } from "pixi.js"
import { Spine, TextureAtlas } from "pixi-spine"
import { AtlasAttachmentLoader, Skeleton, SkeletonData, SkeletonJson } from "@pixi-spine/runtime-4.0"
import { DisplayMeta } from "./TestBench"
import { screenHeight, screenWidth } from "./bindFileDragNDrop"
import { FileNamesAndUrls } from "./loadZip"
import { center } from "./util"

export async function loadSpineFiles(files: FileNamesAndUrls, app: Testbench) {
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

    if (animation.height > screenHeight * .9)
        animation.scale.set(screenHeight / animation.height * .6 * .5)
    const bounds = animation.getBounds()

    if (bounds.left < -50)
        animation.x = -bounds.left + (screenWidth - animation.width) / 2
    if (bounds.top < -50)
        animation.y = -bounds.top + (screenHeight - animation.height) / 2

    animation.state.setAnimation(0, skeleton.animations[0].name, true)

    let animationIndex = 0
    toggleAnimation(); app.filteredContainer.addChild(animation)

    animation.cursor = 'pointer'
    animation.interactive = true
    animation.on('pointerdown', () => {
        toggleAnimation()
    })

    center(app, animation)
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
        if (animationIndex >= skeleton.animations.length)
            animationIndex = 0

        animation.state.setAnimation(0, skeleton.animations[animationIndex].name, true)

        animationIndex++
    }

}
