import { DisplayObject } from 'pixi.js'
import Testbench from './TestBench'

export function center(app: Testbench, child: DisplayObject) {
    const desiredHeight = app.screen.height / 2
    const boundsBefore = child.getBounds()
    child.scale.set(desiredHeight / boundsBefore.height)
    const boundsAfter = child.getBounds()
    const finalX = (app.screen.width - boundsAfter.width) / 2
    const finalY = (app.screen.height - boundsAfter.height) / 2
    child.x = finalX
    child.y = finalY
    console.log({ desiredHeight, boundsBefore, boundsAfter, finalX, finalY })
    console.log(child)
}
