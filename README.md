# Pixi Testbench

Drag and drop pngs, spine exports in a .zip (.json, .atlas, .png(s)), or after effects export .zip.

powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte), deployed to [Vercel](https://vercel.com).

## Creating a project

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

This uses the adapter-auto for SvelteKit, which detects Vercel and runs adapter-vercel on your behalf.

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.
