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

/** The house rules as numbered articles across the panels of a folding screen. */
const Rules = () => (
  <Box
    component="ol"
    sx={{
      listStyle: "none",
      m: 0,
      p: 0,
      columnCount: { xs: 1, sm: 2, md: 4 },
      columnGap: { xs: 0, sm: 5 },
      // The fold between two panels of the screen.
      columnRule: line(colors.inkRule),
    }}
  >
    {RULES.map((rule, index) => (
      <Box
        component="li"
        key={rule}
        sx={{
          breakInside: "avoid",
          display: "grid",
          gridTemplateColumns: "2.25rem minmax(0, 1fr)",
          alignItems: "baseline",
          columnGap: 1,
          pb: 2.5,
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
