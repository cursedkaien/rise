# RISE

A responsive, fan-made RISE project site inspired by the zero-gravity indicator selected for NASA's Artemis II mission. The site tells the character's story with a Three.js scene, two scroll-animated 3D models, live token figures, and project links.

RISE token is a separate fan-made project. This site and token are not affiliated with NASA and are not financial advice.

## Features

- A 3D preloader built with React Three Fiber. It assembles, holds, and disperses the globe scene before revealing the page.
- A desktop scroll scene that animates the two segmented GLB models in sequence. The first model assembles after the preloader, moves apart and reassembles as the story progresses, then hands off to the second model.
- Separate responsive 3D stages for mobile layouts.
- An optional sound control. When enabled, a short synthesized motif plays during the preloader, with soft cues at story animation milestones. Sound is off by default and uses the browser Web Audio API; there are no external audio files.
- A particle Earth built by sampling the brightness of a world map texture.
- Story, impact, community, how-to-buy, and FAQ sections.
- Live token figures fetched from DexScreener, plus a copyable contract address and a Jupiter swap link.
- Reduced-motion and WebGL fallback handling.

## Tech stack and tools

### Application and 3D

- **React** renders the site and manages its interactive UI.
- **Vite** handles the development server and production build.
- **Three.js** provides the WebGL scene, geometry, materials, lights, and animation primitives.
- **React Three Fiber** (`@react-three/fiber`) connects Three.js scenes to React and supplies the Canvas, render loop, and pointer/viewport state.
- **Drei** (`@react-three/drei`) provides GLTF loading and preloading through `useGLTF`.
- **Blender** was used to split the two keychain GLB models into independently animated parts.
- **Web Audio API** generates the optional preloader music and scroll cues in code.
- **ESLint** checks the JavaScript and JSX source.

### Design assets

- The GLB models were created for this project. The keychain models were split into parts in Blender so their pieces can travel in from different directions and assemble.
- `public/world-map.png` is a world map image downloaded via Google and used as the source texture for the particle Earth in `src/components/ParticleEarth.jsx`.
- **Bricolage Grotesque Variable** and **Geist Variable** are used for the display and interface typography and are loaded through Fontsource.
- A RISE favicon is provided at `public/favicon.svg`.

## 3D assets

The files in `public/` are the runtime assets loaded by the site:

| File                | Use                                                       |
| ------------------- | --------------------------------------------------------- |
| `keychain1-web.glb` | First segmented keychain model in the story scene         |
| `keychain2-web.glb` | Second segmented mascot/keychain model in the story scene |
| `mascot-mobile.glb` | Mascot model used in the preloader globe scene            |
| `world-map.png`     | Image sampled to create the particle Earth                |
| `icons.svg`         | Shared SVG icon symbols                                   |
| `favicon.svg`       | Browser tab icon                                          |

Original and intermediate model files are kept in `assets/source-models/`. The source font archive is in `assets/source-fonts/`.

## Project structure

```text
assets/
  source-fonts/       Original font archive
  source-models/      Original and intermediate GLB files
public/
  fonts/              Font files served directly by the site
  *.glb               Runtime 3D models
  world-map.png       Particle Earth source image
src/
  components/         Preloader, Three.js scenes, models, audio, and WebGL handling
  ui/                 Page sections and token data hook
  edition.css         Main site layout and responsive styles
  main.jsx            React entry point
```

## Data and external links

The live token figures are requested from the DexScreener token-pairs endpoint by `src/ui/useMemecoin.jsx`. The contract address and public community links are defined in the UI components. The site includes a Jupiter swap link, but it does not connect to or control a user's wallet.

## License

The repository includes an MIT license in `LICENSE`. Third-party fonts, libraries, and sourced media may have their own terms.
