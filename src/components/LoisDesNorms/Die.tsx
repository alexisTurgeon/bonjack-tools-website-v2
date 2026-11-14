import { useId } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { fadeIn, REDUCED, tumble } from "./motion";
import { colors, fonts, motion } from "./tokens";

// A d20 seen face-on: hexagonal outline, the top face (the numbered triangle)
// in the middle, nine front facets around it, and the back of the solid
// faintly visible through the resin.
const T = "50,3";
const UR = "93,27";
const LR = "93,81";
const B = "50,105";
const LL = "7,81";
const UL = "7,27";
const A = "50,24";
const R = "79,74";
const L = "21,74";
// The back face: the front face turned half a turn about the centre.
const A2 = "50,84";
const R2 = "21,34";
const L2 = "79,34";

const OUTLINE = `${T} ${UR} ${LR} ${B} ${LL} ${UL}`;
const TOP_FACE = `${A} ${R} ${L}`;

type Material = "lit" | "light" | "mid" | "shade" | "deep" | "glow";

/** Front facets and the resin tone each one shows, lit from the upper left. */
const FACETS: [string, Material][] = [
  [`${T} ${A} ${UL}`, "lit"],
  [`${T} ${UR} ${A}`, "light"],
  [`${UL} ${A} ${L}`, "light"],
  [`${UR} ${R} ${A}`, "mid"],
  [`${UL} ${L} ${LL}`, "mid"],
  [`${UR} ${LR} ${R}`, "shade"],
  [`${LL} ${L} ${B}`, "shade"],
  [`${LR} ${B} ${R}`, "deep"],
  // Light that crossed the body comes out through the bottom facet.
  [`${L} ${R} ${B}`, "glow"],
];

/** Edges of the back of the solid, seen through the front. */
const BACK_EDGES = [
  [A2, R2], [R2, L2], [L2, A2],
  [A2, B], [A2, LR], [A2, LL],
  [R2, LL], [R2, UL], [R2, T],
  [L2, UR], [L2, LR], [L2, T],
];

const MATERIALS: Record<Material, [string, string]> = {
  lit: ["#FFE09A", "#F4AE43"],
  light: ["#FCC566", "#E39027"],
  mid: ["#EFA53E", "#C4761A"],
  shade: ["#D3861F", "#97530B"],
  deep: ["#B4680F", "#723A05"],
  glow: ["#FFD27A", "#C8761A"],
};

const DIM_OPACITY = 0.45;
const DIM_NUMERAL = "#FFD48A";

// A roll starts the cooldown at once, so the die mounts dim; this runs from the
// lit look to the dim one after the tumble has landed.
const settle = keyframes`
  from { opacity: 1; }
  to { opacity: ${DIM_OPACITY}; }
`;
const settleNumeral = keyframes`
  from { fill: ${colors.amberInk}; }
  to { fill: ${DIM_NUMERAL}; }
`;
/** The shadow tightens as the die comes down onto the felt. */
const shadowLand = keyframes`
  0% { transform: scale(0.55); opacity: 0.35; }
  55% { transform: scale(1.04); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;
const afterLanding = (name: string) => `${name} 240ms ease-out ${motion.tumble}ms both`;

interface Props {
  /** The number on the top face; undefined before the first roll. */
  value?: number;
  /** Not ready: the resin is shown dim. */
  dim: boolean;
  /** Changes on every roll seen live; 0 means no roll seen since the page opened. */
  rollSeq: number;
}

const numeralSize = (value: number) => (value < 10 ? 30 : value < 100 ? 24 : 18);

/** Amber resin d20 lying on the felt; its top face shows the roll count. */
const Die = ({ value, dim, rollSeq }: Props) => {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const rolled = rollSeq > 0;

  return (
    <Box
      key={rollSeq}
      component="svg"
      viewBox="0 0 100 118"
      aria-hidden
      sx={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        {Object.entries(MATERIALS).map(([name, [from, to]]) => (
          <linearGradient key={name} id={`${id}-${name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        ))}
        {/* The body: brightest in the core, where light crosses the most resin. */}
        <radialGradient id={`${id}-core`} cx="50%" cy="58%" r="58%">
          <stop offset="0" stopColor="#FFD27A" />
          <stop offset="0.5" stopColor="#EE9B2A" />
          <stop offset="1" stopColor="#934C07" />
        </radialGradient>
        <radialGradient id={`${id}-face`} cx="50%" cy="72%" r="78%">
          <stop offset="0" stopColor="#FFDA8C" />
          <stop offset="1" stopColor={colors.amber} />
        </radialGradient>
        <radialGradient id={`${id}-spec`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#02100A" stopOpacity="0.6" />
          <stop offset="1" stopColor="#02100A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-caustic`}>
          <stop offset="0" stopColor={colors.amber} stopOpacity="0.4" />
          <stop offset="1" stopColor={colors.amber} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cast shadow on the felt, with a little amber light let through the resin. */}
      <Box
        component="g"
        sx={{
          transformBox: "fill-box",
          transformOrigin: "center",
          opacity: dim ? 0.5 : 1,
          animation: rolled ? `${shadowLand} ${motion.tumble}ms ${motion.easeOut} both` : "none",
          [REDUCED]: { animation: "none" },
        }}
      >
        <ellipse cx="53" cy="109" rx="40" ry="7" fill={ref("shadow")} />
        {!dim && <ellipse cx="60" cy="108" rx="20" ry="4" fill={ref("caustic")} />}
      </Box>

      <Box
        component="g"
        sx={{
          transformBox: "fill-box",
          transformOrigin: "center",
          animation: rolled ? `${tumble} ${motion.tumble}ms ${motion.easeOut} both` : "none",
          [REDUCED]: { animation: "none" },
        }}
      >
        <Box
          component="g"
          sx={{
            opacity: dim ? DIM_OPACITY : 1,
            animation: rolled && dim ? afterLanding(settle) : "none",
            [REDUCED]: { animation: "none" },
          }}
        >
          <polygon points={OUTLINE} fill={ref("core")} />
          <g stroke="#FFE7B4" strokeWidth="1.1" strokeOpacity="0.6" strokeLinecap="round">
            {BACK_EDGES.map(([from, to]) => {
              const [x1, y1] = from.split(",");
              const [x2, y2] = to.split(",");
              return <line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
          {FACETS.map(([points, material]) => (
            <polygon key={points} points={points} fill={ref(material)} fillOpacity="0.76" />
          ))}
          <polygon points={TOP_FACE} fill={ref("face")} fillOpacity="0.92" />
          <g fill="none" stroke="#FFE8BA" strokeWidth="0.9" strokeOpacity="0.65" strokeLinejoin="round">
            {FACETS.map(([points]) => (
              <polygon key={points} points={points} />
            ))}
          </g>
          <polygon points={OUTLINE} fill="none" stroke="#7A4307" strokeWidth="1.6" strokeLinejoin="round" />
          {/* Rim light on the upper-left edges and the specular hotspot. */}
          <polyline points={`${LL} ${UL} ${T}`} fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1.2" />
          <ellipse cx="33" cy="24" rx="10" ry="4.5" transform="rotate(-29 33 24)" fill={ref("spec")} />
          <ellipse cx="30" cy="24.5" rx="3" ry="1.4" transform="rotate(-29 30 24.5)" fill="#FFFFFF" fillOpacity="0.9" />
        </Box>

        {/* At rest during the cooldown: a lit amber outline over the dimmed body. */}
        <Box
          component="polygon"
          points={OUTLINE}
          fill="none"
          stroke={colors.amber}
          strokeWidth="1.8"
          strokeLinejoin="round"
          sx={{
            opacity: dim ? 1 : 0,
            animation: rolled && dim ? afterLanding(fadeIn) : "none",
            [REDUCED]: { animation: "none" },
          }}
        />

        <Box
          component="text"
          x="50"
          y={value === undefined ? 60 : 58}
          textAnchor="middle"
          dominantBaseline="central"
          sx={{
            fill: dim ? DIM_NUMERAL : colors.amberInk,
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: value === undefined ? 15 : numeralSize(value),
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            animation: rolled
              ? [
                  `${fadeIn} ${motion.quick}ms ease-out ${motion.tumble * 0.7}ms both`,
                  ...(dim ? [afterLanding(settleNumeral)] : []),
                ].join(", ")
              : "none",
            [REDUCED]: { animation: "none" },
          }}
        >
          {/* Before the first roll the top face carries the game's mark. */}
          {value === undefined ? "LdN" : value}
        </Box>
      </Box>
    </Box>
  );
};

export default Die;
