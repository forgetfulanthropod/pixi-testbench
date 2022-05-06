import Testbench, { DisplayMeta } from "./TestBench"
import { FileNamesAndUrls } from "./loadZip"
import { AnimatedSprite, BaseTexture, Filter, Loader, Spritesheet } from "pixi.js"

export async function loadTexturePackerFiles(files: FileNamesAndUrls, app: Testbench) {
    const jsonFile = files.find(file => file.name.includes('.json'))!
    const pngFile = files.find(file => file.name.includes('.png'))!

    const spritesheetData = await (await fetch(jsonFile.url)).json()
    const baseTexture = BaseTexture.from(pngFile.url)


    new Loader().add(jsonFile.url).load(
        (_, resources) => console.log('loaded!!', { resources })
    )

    console.log({ spritesheetData })

    const sheet = new Spritesheet(
        baseTexture,
        spritesheetData
    )

    sheet.parse(textures => console.log({ textures }))


    const animation = Object.values(sheet.animations)[0]

    if (animation == null) throw new Error('looks like no animations from that data...')

    const animatedSprite = new AnimatedSprite(animation)

    animatedSprite.animationSpeed = 30 / app.ticker.FPS

    console.log({ animationSpeed: animatedSprite.animationSpeed })

    animatedSprite.play()

    app.filteredContainer.addChild(animatedSprite)

    app.addNewImportControls({
        name: jsonFile.name,
        get(): DisplayMeta {
            return {
                x: animatedSprite.x,
                y: animatedSprite.y,
                scale: animatedSprite.scale.x,
                animationSpeed: animatedSprite.animationSpeed
            }
        },
        set(d: DisplayMeta) {
            animatedSprite.x = d.x
            animatedSprite.y = d.y

            animatedSprite.scale.set(d.scale, Math.abs(d.scale))

            if (d.animationSpeed) animatedSprite.animationSpeed = d.animationSpeed
        },
        applyFilters(filters: Filter[]) {
            animatedSprite.filters = filters
        }
    })
}
