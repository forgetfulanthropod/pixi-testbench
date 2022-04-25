
import './style.css'
import DemoApplication from './DemoApplication';
import * as filters from './filters';
import * as zip from '@zip.js/zip.js'
// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// import './ga';

const container = document.querySelector<HTMLElement>('#container')!
const dragHover = document.querySelector<HTMLDivElement>('.drag-enter')!


const app = new DemoApplication();
const manifest = [
    // { name: 'background', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // // { name: 'background', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // { name: 'overlay', url: 'images/overlay.png' },
    // { name: 'map', url: 'images/displacement_map.png' },
    // { name: 'fish1', url: '/Frog_Knight_sprite-200-6LOWXNDL.png' },
    // { name: 'fish2', url: '/FrogWizard-cropped-200-OJOSIGV5.png' },
    // { name: 'fish3', url: '/Gnome_hooligan-200-NRGJZ24H.png' },
    // { name: 'fish4', url: '/green_jester-200-475SHUVH.png' },
    // { name: 'lightmap', url: 'images/lightmap.png' },
    // { name: 'colormap', url: 'images/colormap.png' },

    { name: 'background', url: 'images/cave-final.png' },
    // { name: 'overlay', url: 'images/overlay.png' },
    { name: 'map', url: 'images/displacement_map.png' },
    // { name: 'fish1', url: 'images/displacement_fish1.png' },
    // { name: 'fish2', url: 'images/displacement_fish2.png' },
    // { name: 'fish3', url: 'images/displacement_fish3.png' },
    // { name: 'fish4', url: 'images/displacement_fish4.png' },
    { name: 'lightmap', url: 'images/lightmap.png' },
    { name: 'colormap', url: 'images/colormap.png' },
];

// Load resources then add filters
app.load(manifest, () => {
    for (const i in filters) {
        //@ts-expect-error
        filters[i].call(app);
    }
});

container.ondragover = (e) => {
    e.preventDefault() // necessary
    
}

container.ondragenter = (e) => {
    dragHover.style.opacity = '1'
}

container.ondragleave = (e) => {
    dragHover.style.opacity = '0'
}

// fileInput.onchange = () => console.log('dropped')
container.ondrop = async(e) => {
    e.preventDefault()
    
    dragHover.style.opacity = '0'
    console.log('dropped')

    console.log({files: e.dataTransfer?.files})
    if (e.dataTransfer?.files.length !== 1) {
        alert('sorry, must drop one .png or .zip')
        return
    }

    const entries = await getEntries(e.dataTransfer?.files?.[0] as Blob, {})

    console.log({entries})
}

function getEntries(file: Blob, options: zip.ZipReaderGetEntriesOptions) {
    return (new zip.ZipReader(new zip.BlobReader(file))).getEntries(options);
}