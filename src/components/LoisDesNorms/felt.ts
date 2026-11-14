/**
 * Felt nap drawn with SVG turbulence: fine light and dark fibres plus a broad,
 * uneven dye mottle. Tiles seamlessly (stitchTiles) and needs no image file.
 */

const svgUrl = (svg: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;

interface NapOptions {
  seed: number;
  /** Opacity of the light fibres. */
  light: number;
  /** Opacity of the dark fibres. */
  dark: number;
}

const FIBRE_TILE = 240;
const MOTTLE_TILE = 720;

const fibres = ({ seed, light, dark }: NapOptions) =>
  svgUrl(`
  <svg xmlns='http://www.w3.org/2000/svg' width='${FIBRE_TILE}' height='${FIBRE_TILE}'>
    <filter id='l' x='0' y='0' width='100%' height='100%'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9 0.62' numOctaves='3' seed='${seed}' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0.93 0 0 0 0 0.98 0 0 0 0 0.9 3 0 0 0 -1.42'/>
    </filter>
    <filter id='d' x='0' y='0' width='100%' height='100%'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9 0.62' numOctaves='3' seed='${seed + 17}' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0 0 0 0 0 0.04 0 0 0 0 0.02 -3 0 0 0 1.58'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#l)' opacity='${light}'/>
    <rect width='100%' height='100%' filter='url(#d)' opacity='${dark}'/>
  </svg>`);

const mottle = (seed: number) =>
  svgUrl(`
  <svg xmlns='http://www.w3.org/2000/svg' width='${MOTTLE_TILE}' height='${MOTTLE_TILE}'>
    <filter id='m' x='0' y='0' width='100%' height='100%'>
      <feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='2' seed='${seed}' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0 0 0 0 0 0.03 0 0 0 0 0.02 -2.2 0 0 0 1.25'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#m)' opacity='0.5'/>
  </svg>`);

const napSx = (options: NapOptions) => ({
  backgroundImage: `${fibres(options)}, ${mottle(options.seed + 5)}`,
  backgroundSize: `${FIBRE_TILE}px ${FIBRE_TILE}px, ${MOTTLE_TILE}px ${MOTTLE_TILE}px`,
});

/** The table the mats lie on. */
export const tableNap = napSx({ seed: 3, light: 0.2, dark: 0.5 });
/** The play mat. */
export const matNap = napSx({ seed: 41, light: 0.26, dark: 0.5 });
