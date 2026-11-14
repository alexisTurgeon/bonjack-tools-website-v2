import { Box } from "@mui/material";
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

/**
 * Going dim waits for the tumble to land (a roll starts the cooldown at once);
 * becoming ready shows straight away.
 */
const dimTransition = (dim: boolean, properties: string[]) =>
  properties
    .map((p) => (dim ? `${p} 220ms ease-out ${motion.tumble}ms` : `${p} ${motion.quick}ms ease-out`))
    .join(", ");

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
      <g style={{ opacity: dim ? 0.34 : 1, transition: dimTransition(dim, ["opacity"]) }}>
        {FACETS.map(([points, fill]) => (
          <polygon key={points} points={points} fill={fill} />
        ))}
        <polygon points={TOP_FACE} fill={colors.amber} />
        {/* Light caught on the upper-left edge of the resin. */}
        <polygon points="50,7 12,29 16,31 50,11" fill="#FFF3D6" opacity="0.55" />
      </g>
      <g
        fill="none"
        strokeWidth="1.6"
        strokeLinejoin="round"
        style={{ stroke: dim ? colors.amber : EDGE, transition: dimTransition(dim, ["stroke"]) }}
      >
        {FACETS.map(([points]) => (
          <polygon key={points} points={points} />
        ))}
        <polygon points={TOP_FACE} />
        <polygon points={OUTLINE} strokeWidth="2.2" />
      </g>
      <Box
        component="text"
        x="50"
        y={value === undefined ? 62 : 58}
        textAnchor="middle"
        dominantBaseline="central"
        sx={{
          fill: dim ? "#FFD48A" : colors.amberInk,
          transition: dimTransition(dim, ["fill"]),
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: value === undefined ? 10.5 : numeralSize(value),
          letterSpacing: value === undefined ? "0.04em" : "-0.02em",
          fontVariantNumeric: "tabular-nums",
          animation: rolled ? `${fadeIn} ${motion.quick}ms ease-out ${motion.tumble * 0.7}ms both` : "none",
          [REDUCED]: { animation: "none" },
        }}
      >
        {value === undefined ? "START" : value}
      </Box>
    </Box>
  );
};

export default Die;
