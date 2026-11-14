import { Box, Typography } from "@mui/material";
import { colors, fonts, line, visuallyHidden } from "./tokens";

const RULES = [
  "Invade MANDATORY",
  "We can't swap role or champions",
  "You take the first champion you roll",
  "Support takes support item and jungle takes smite and jungle item",
  "You need to play until you win",
  "You can't surrender",
  "If a rematch is called and everyone jumps in, the rules start over again",
];

/**
 * Where each article sits on the screen from md up: the first spans both
 * panels above the horizontal fold, then three articles per panel.
 */
const placement = (index: number) => {
  if (index === 0) return { gridColumn: "1 / -1", borderBottom: line(colors.inkRule), mb: 2.5 };
  const panel = index <= 3 ? 1 : 2;
  const row = panel === 1 ? index + 1 : index - 2;
  return {
    gridColumn: panel,
    gridRow: row,
    ...(panel === 2 ? { borderLeft: line(colors.inkRule), pl: 5 } : { pr: 5 }),
  };
};

/** The house rules as numbered articles on a folding screen of two panels. */
const Rules = () => (
  <Box
    component="ol"
    sx={{
      listStyle: "none",
      m: 0,
      p: 0,
      display: "grid",
      gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
    }}
  >
    {RULES.map((rule, index) => (
      <Box
        component="li"
        key={rule}
        sx={{
          display: "grid",
          gridTemplateColumns: "2.25rem minmax(0, 1fr)",
          alignItems: "baseline",
          columnGap: 1,
          pb: 2.5,
          "@media (min-width: 900px)": placement(index),
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ fontFamily: fonts.display, fontWeight: 750, fontSize: "1.75rem", lineHeight: 1, color: colors.ink }}
        >
          {index + 1}
        </Box>
        <Typography sx={{ fontSize: "1rem", lineHeight: 1.45, color: colors.ink }}>
          <span style={visuallyHidden}>{`Rule ${index + 1}: `}</span>
          {rule}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default Rules;
