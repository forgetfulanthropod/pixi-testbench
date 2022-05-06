import GUI from 'lil-gui'


import * as filters from 'pixi-filters'
import {
    Application,
    // settings,
    Container,
    Rectangle,
    Sprite,
    // TilingSprite,
    utils,
    filters as externalFilters,
    Filter,
} from 'pixi.js'
import { screenWidth, screenHeight } from './bindFileDragNDrop'
import { Manifest } from './main'

const { EventEmitter } = utils

export type DisplayMeta = {
    x: number
    y: number
    scale: number
    animationSpeed?: number // 1 is normal
}
type DisplayItem = {
    name: string
    get: () => DisplayMeta
    set: (meta: DisplayMeta) => void
    applyFilters: (filters: Filter[]) => void
}

export default class Testbench extends Application {
    domElement: HTMLDivElement
    initWidth: number
    initHeight: number
    animating: boolean
    rendering: boolean
    events: any
    animateTimer: any
    bg: any
    // unfilteredContainer = new Container()
    filteredContainer = new Container()
    sceneFilters: any
    filterArea: any
    padding: any
    bounds: any
    importsFolder: any
    gui: any

    constructor() {
        const gui = new GUI()

        const domElement = document.querySelector('#container') as HTMLDivElement
        const initWidth = domElement.offsetWidth
        const initHeight = domElement.offsetHeight

        super({
            view: document.querySelector('#stage') as HTMLCanvasElement,
            width: initWidth,
            height: initHeight,
            autoStart: false,
            backgroundColor: 0x000000,
        })
        this.ticker.maxFPS = 1000 / 33 //min delta (max fps)
        this.ticker.minFPS = 1000 / 30 //max delta (min fps)

        const fpsEl = document.getElementById('fps')!
        this.ticker.add(_ => {
            fpsEl.innerText = `${Math.round(app.ticker.FPS)} frames per second`
        })

        this.domElement = domElement

        this.initWidth = initWidth
        this.initHeight = initHeight
        this.animating = true
        this.rendering = true
        this.events = new EventEmitter()
        this.animateTimer = 0
        this.bg = null
        this.sceneFilters = []
        this.filterArea = new Rectangle()
        this.padding = 100
        this.bounds = new Rectangle(-this.padding, -this.padding,
            initWidth + (this.padding * 2),
            initHeight + (this.padding * 2),
        )

        const app = this

        this.gui = gui
        this.gui.add(this, 'rendering')
            .name('&bull; Rendering')
            .onChange((value: boolean) => {
                if (!value) {
                    app.stop()
                } else {
                    app.start()
                }
            })

        const closuredAnimate = () => this.animate()

        this.gui.add(this, 'animating')
            .name('&bull; Animating')
            .onChange((value: boolean) => {
                if (!value) {
                    this.ticker.remove(closuredAnimate)
                } else {
                    this.ticker.add(closuredAnimate)
                }
            })

        this.ticker.add(closuredAnimate)

        this.gui
            .add({
                saveJson() {
                    const guiSave = gui.save() as { folders: Record<string, any> }

                    const enabledFolders: Record<string, any> = {}
                    Object.keys(guiSave.folders).filter(fKey => {
                        return guiSave.folders[fKey].controllers.enabled
                    }).forEach(fKey => {
                        enabledFolders[fKey] = guiSave.folders[fKey]
                    })

                    const enabledFilters = {
                        ...guiSave,
                        folders: enabledFolders
                    }
                    console.log('saving', { enabledFilters })

                    saveFile(enabledFilters, 'pixi-filters.json')
                    // localStorage.setItem('save', JSON.stringify(gui.save()))
                }
            }, 'saveJson')
            .name('Save as JSON')

        this.importsFolder = this.gui.addFolder('YOUR IMPORTS')
    }

    addNewImportControls(item: DisplayItem) {
        const folder = this.importsFolder.addFolder(item.name.slice(0, 24)).close()

        this.gui.folders.splice(this.gui.folders.length - 1, 1)
        this.gui.folders.splice(0, 0, folder)

        // this.gui.folders = [...]

        const displayMeta = item.get()

        folder.add(displayMeta, 'x', -screenWidth, screenWidth).onChange((x: number) => {
            item.set({ ...displayMeta, x })
        })

        folder.add(displayMeta, 'y', -screenHeight, screenHeight).onChange((y: number) => {
            item.set({ ...displayMeta, y })
        })

        folder.add(displayMeta, 'scale', -1.2, 1.2).onChange((scale: number) => {
            item.set({ ...displayMeta, scale })
        })

        if (displayMeta.animationSpeed) {
            folder.add(displayMeta, 'animationSpeed', 0, 10).onChange((animationSpeed: number) => {
                item.set({ ...displayMeta, animationSpeed })
            })
        }

        folder.add({ filtersOnlyHere: false }, 'filtersOnlyHere').onChange((only: boolean) => {
            if (only) {
                item.applyFilters(this.sceneFilters)
                this.filteredContainer.filters = []
            } else {
                item.applyFilters([])
                this.filteredContainer.filters = this.sceneFilters
            }
        })
    }

    /**
     * Convenience for getting resources
     * @member {object}
     */
    get resources() {
        return this.loader.resources
    }

    /**
     * Load resources
     * @param {object} manifest Collection of resources to load
     */
    load(manifest: Manifest, callback: () => void) {
        this.loader.add(manifest).load(() => {
            callback()
            this.init()
            this.start()
        })
    }

    /**
     * Called when the load is completed
     */
    init() {
        const { resources } = this.loader
        // const { bounds, initWidth, initHeight } = this;

        // Setup the container
        this.filteredContainer = new Container()
        this.filteredContainer.filterArea = this.filterArea
        this.filteredContainer.filters = this.sceneFilters
        // this.unfilteredContainer = new Container()
        // this.stage.addChild(this.unfilteredContainer)
        this.stage.addChild(this.filteredContainer)

        // Setup the background image
        this.bg = new Sprite(resources.background.texture)
        this.filteredContainer.addChild(this.bg)

        window.addEventListener('resize', this.handleResize.bind(this))
        this.handleResize()
    }

    /**
     * Resize the demo when the window resizes
     */
    handleResize() {
        const { padding, bg, filterArea, bounds } = this

        const width = this.domElement.offsetWidth
        const height = this.domElement.offsetHeight
        const filterAreaPadding = 0

        // Use equivalent of CSS's contain for the background
        // so that it scales proportionally
        const bgAspect = bg.texture.width / bg.texture.height
        const winAspect = width / height

        if (winAspect > bgAspect) {
            bg.width = width
            bg.height = width / bgAspect
        } else {
            bg.height = height
            bg.width = height * bgAspect
        }

        bg.x = (width - bg.width) / 2
        bg.y = (height - bg.height) / 2

        // overlay.width = width;
        // overlay.height = height;

        bounds.x = -padding
        bounds.y = -padding
        bounds.width = width + (padding * 2)
        bounds.height = height + (padding * 2)

        filterArea.x = filterAreaPadding
        filterArea.y = filterAreaPadding
        filterArea.width = width - (filterAreaPadding * 2)
        filterArea.height = height - (filterAreaPadding * 2)

        this.events.emit('resize', width, height)

        this.renderer.resize(width, height)

        this.render()
    }

    /**
     * Animate
     * @param {number} delta - % difference in time from last frame render
     */
    animate(delta?: number) {
        this.animateTimer += delta

        const { animateTimer } = this

        this.events.emit('animate', delta, animateTimer)

        if (!this.animating) {
            return
        }
    }

    /**
     * Add a new filter
     * @param {string} id Class name
     * @param {object|function} options The class name of filter or options
     * @param {string} [options.id] The name of the PIXI.filters class
     * @param {boolean} [options.global] Filter is in pixi.js
     * @param {array} [options.args] Constructor arguments
     * @param {boolean} [options.enabled=false] Filter is enabled by default
     * @param {boolean} [options.opened=false] Filter Folder is opened by default
     * @param {function} [oncreate] Function takes filter and gui folder as
     *        arguments and is scoped to the Demo application.
     * @return {PIXI.Filter} Instance of new filter
     */
    addFilter(id: string, options: any) {
        if (typeof options === 'function') {
            options = { oncreate: options }
        }

        options = Object.assign({
            name: id,
            enabled: false,
            opened: false,
            args: null,
            global: false,
            oncreate: null,
        }, options)

        if (options.global) {
            options.name += ' (pixi.js)'
        }

        const app = this
        const folder = this.gui.addFolder(options.name).close()
        //@ts-expect-error
        const ClassRef = filters[id] || externalFilters[id]

        if (!ClassRef) {
            throw new Error(`Unable to find class name with "${id}"`)
        }

        let filter

        if (options.args) {
            // eslint-disable-next-line func-style
            const ClassRefArgs = function (a: object) {
                //@ts-expect-error
                ClassRef.apply(this, a)
            }

            ClassRefArgs.prototype = ClassRef.prototype
            //@ts-expect-error
            filter = new ClassRefArgs(options.args)
        } else {
            filter = new ClassRef()
        }

        // Set enabled status
        filter.enabled = options.enabled

        // Track enabled change with analytics
        folder.add(filter, 'enabled').onChange((enabled: boolean) => {
            // ga('send', 'event', id, enabled ? 'enabled' : 'disabled');

            app.events.emit('enable', enabled)

            this.render()
            if (enabled) {
                folder.domElement.className += ' enabled'
            } else {
                folder.domElement.className = folder.domElement.className.replace(' enabled', '')
            }
        })

        if (options.opened) {
            folder.open()
        }

        if (options.enabled) {
            folder.domElement.className += ' enabled'
        }

        if (options.oncreate) {
            options.oncreate.call(filter, folder)
        }

        this.sceneFilters.push(filter)
        return filter
    }
}

async function saveFile(obj: object, fileName: string) {

    const content = JSON.stringify(obj, null, 2)
    var a = document.createElement('a')
    var file = new Blob([content], { type: 'application/json' })
    a.href = URL.createObjectURL(file)
    a.download = fileName
    a.click()
    a.remove()
}