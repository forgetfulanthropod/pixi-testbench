import Testbench from "./TestBench"
import { FileNamesAndUrls } from "./loadZip"
import { AnimatedSprite, BaseTexture, Framebuffer, Loader, LoaderResource, Spritesheet } from "pixi.js"

export async function loadTexturePackerFiles(files: FileNamesAndUrls, app: Testbench) {
    const jsonFile = files.find(file => file.name.includes('.json'))!
    const pngFile = files.find(file => file.name.includes('.png'))!

    // const spritesheetData = (await (await fetch(jsonFile.url)).json())?.frames
    const spritesheetData = await (await fetch(jsonFile.url)).json()
    const baseTexture = BaseTexture.from(pngFile.url)

    // Loader.shared.add({loadType: LoaderResource.LOAD_TYPE.})


    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log({ spritesheetData })

    const sheet = new Spritesheet(
        baseTexture,
        spritesheetData
    )

    console.log({ sheet })

    const animation = Object.values(sheet.animations)[0]

    if (animation == null) throw new Error('looks like no animations from that data...')

    const animatedSprite = new AnimatedSprite(animation)

    app.filteredContainer.addChild(animatedSprite)
}
