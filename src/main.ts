import './style.css'
import DemoApplication from './DemoApplication';
import * as filters from './filters';

// const app = document.querySelector<HTMLDivElement>('#app')!

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `
// import './ga';


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

    { name: 'background', url: 'images/displacement_BG.jpg' },
    // { name: 'overlay', url: 'images/overlay.png' },
    { name: 'map', url: 'images/displacement_map.png' },
    { name: 'fish1', url: 'images/displacement_fish1.png' },
    { name: 'fish2', url: 'images/displacement_fish2.png' },
    { name: 'fish3', url: 'images/displacement_fish3.png' },
    { name: 'fish4', url: 'images/displacement_fish4.png' },
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