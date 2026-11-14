import { Box } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { fadeIn, REDUCED, tumble } from "./motion";
import { colors, fonts, motion } from "./tokens";

// A d20 seen face-on: hexagonal outline, the top face (the numbered
// triangle) in the middle and the nine facets around it.
const T = "50,3";
const UR = "93,27";
const LR = "93,81";
const B = "50,105";
const LL = "7,81";
const UL = "7,27";
const A = "50,24";
const R = "79,74";
const L = "21,74";

/** Facet tones of amber resin lit from the upper left; darker where light passes through more resin. */
const FACETS: [string, string][] = [
  [`${T} ${A} ${UL}`, "#FAD089"],
  [`${T} ${UR} ${A}`, "#F6BC5C"],
  [`${UL} ${A} ${L}`, "#F4B24B"],
  [`${UR} ${R} ${A}`, "#E2952A"],
  [`${UL} ${L} ${LL}`, "#E9A13B"],
  [`${UR} ${LR} ${R}`, "#C77A19"],
  [`${LL} ${L} ${B}`, "#D3861F"],
  [`${LR} ${B} ${R}`, "#A9620F"],
  [`${L} ${R} ${B}`, "#BE7218"],
];
const TOP_FACE = `${A} ${R} ${L}`;
const OUTLINE = `${T} ${UR} ${LR} ${B} ${LL} ${UL}`;

const EDGE = "#8E520B";

interface Props {
  /** The number on the top face; undefined shows the Start face. */
  value?: number;
  /** Not ready: the resin is shown dim. */
  dim: boolean;
  /** Changes on every roll seen live; 0 means no roll seen since the page opened. */
  rollSeq: number;
}

const numeralSize = (value: number) => (value < 10 ? 30 : value < 100 ? 24 : 18);

const DIM_OPACITY = 0.34;
const DIM_NUMERAL = "#FFD48A";

// A roll starts the cooldown at once, so the die mounts dim; these run from
// the lit look to the dim one after the tumble has landed.
const settleFacets = keyframes`
  from { opacity: 1; }
  to { opacity: ${DIM_OPACITY}; }
`;
const settleEdges = keyframes`
  from { stroke: ${EDGE}; }
  to { stroke: ${colors.amber}; }
`;
const settleNumeral = keyframes`
  from { fill: ${colors.amberInk}; }
  to { fill: ${DIM_NUMERAL}; }
`;
const afterLanding = (name: string) => `${name} 240ms ease-out ${motion.tumble}ms both`;

/** Amber resin d20 whose top face shows the roll count, or "Start" before the first roll. */
const Die = ({ value, dim, rollSeq }: Props) => {
  const rolled = rollSeq > 0;
  return (
    <Box
      key={rollSeq}
      component="svg"
      viewBox="0 0 100 108"
      aria-hidden
      sx={{
        display: "block",
        width: "100%",
        height: "auto",
        overflow: "visible",
        filter: dim ? "none" : `drop-shadow(0 6px 6px ${colors.shadow})`,
        animation: rolled ? `${tumble} ${motion.tumble}ms ${motion.easeOut} both` : "none",
        [REDUCED]: { animation: "none" },
      }}
    >
      <Box
        component="g"
        sx={{
          opacity: dim ? DIM_OPACITY : 1,
          animation: rolled && dim ? afterLanding(settleFacets) : "none",
          [REDUCED]: { animation: "none" },
        }}
      >
        {FACETS.map(([points, fill]) => (
          <polygon key={points} points={points} fill={fill} />
        ))}
        <polygon points={TOP_FACE} fill={colors.amber} />
        {/* Light caught on the upper-left edge of the resin. */}
        <polygon points="50,7 12,29 16,31 50,11" fill="#FFF3D6" opacity="0.55" />
      </Box>
      <Box
        component="g"
        fill="none"
        strokeWidth="1.6"
        strokeLinejoin="round"
        sx={{
          stroke: dim ? colors.amber : EDGE,
          animation: rolled && dim ? afterLanding(settleEdges) : "none",
          [REDUCED]: { animation: "none" },
        }}
      >
        {FACETS.map(([points]) => (
          <polygon key={points} points={points} />
        ))}
        <polygon points={TOP_FACE} />
        <polygon points={OUTLINE} strokeWidth="2.2" />
      </Box>
      <Box
        component="text"
        x="50"
        y={value === undefined ? 62 : 58}
        textAnchor="middle"
        dominantBaseline="central"
        sx={{
          fill: dim ? DIM_NUMERAL : colors.amberInk,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: value === undefined ? 10.5 : numeralSize(value),
          letterSpacing: value === undefined ? "0.04em" : "-0.02em",
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
        {value === undefined ? "START" : value}
      </Box>
    </Box>
  );
};

export default Die;
