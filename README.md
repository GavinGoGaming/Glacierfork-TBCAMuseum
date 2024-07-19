# TBCA Museum

> Run many early Scratch builds online (or just download them)!

\- the page itself

made with sveltekit

## Developing

you need node.js

```
npm ci
npm run dev
```

to develop with the TBCAMuseum-Builds repo:

- clone TBCAMuseum-Builds next to this repo
- go to `src/lib/buildpath.ts` and change the file
- in another command prompt, do `npm run builds` in this repo folder
- `npm run dev`
- if you added, removed or otherwise changed files, run `npm run update-builddata`
- see also: `src/lib/specialbuilddata.ts`, which contains build info like notes