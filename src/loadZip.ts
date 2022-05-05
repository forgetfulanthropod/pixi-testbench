import Testbench from "./TestBench"
import * as zip from "@zip.js/zip.js"
import { loadAfterEffectsFiles } from "./loadAfterEffectsFiles"
import { loadSpineFiles } from "./loadSpineFiles"

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

    const spineOnlyFile = files.find(file => file.name.includes('.atlas'))!
    if (spineOnlyFile != null)
        await loadSpineFiles(files, app)
    else {
        await loadAfterEffectsFiles(files, app)
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
