import Testbench from "./TestBench"
import * as zip from "@zip.js/zip.js"
import { loadAfterEffectsFiles } from "./loadAfterEffectsFiles"
import { loadSpineFiles } from "./loadSpineFiles"
import { loadTexturePackerFiles } from "./loadTexturePackerFiles"

export type FileNamesAndUrls = { name: string, url: string }[]

export async function loadZip(file: File, app: Testbench) {
    const entries = await getEntries(file as Blob, {})
    console.log({ entries })

    const files: FileNamesAndUrls = []

    await Promise.all(
        entries.filter(entry => !entry.filename.includes('__MACOSX')
        )
            .map(async (entry) => {
                if (entry == null)
                    return

                const blobURL = await getURL(entry
                )

                const nameParts = entry.filename.split('/')
                const filename = nameParts.length > 1 ? nameParts.slice(1).join('/') : entry.filename
                console.log({ filename })
                files.push({ name: filename, url: blobURL })
            })
    )

    if (theseAreSpineFiles(files))
        await loadSpineFiles(files, app)
    else if (await theseAreTexturePackerFiles(files)) {
        loadTexturePackerFiles(files, app)
    } else {
        await loadAfterEffectsFiles(files, app)
    }
}

function theseAreSpineFiles(files: FileNamesAndUrls) {
    return files.find(file => file.name.includes('.atlas')) != null
}

async function theseAreTexturePackerFiles(files: FileNamesAndUrls) {
    const file = files.find(file => file.name.includes('.json'))!

    const data = await (await fetch(file.url)).json()

    return data?.meta?.app?.includes?.('texturepacker')
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
