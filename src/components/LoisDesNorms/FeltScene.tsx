import { ReactNode } from "react";
import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ldnTheme } from "./theme";
import { colors, fonts, sizes } from "./tokens";

/** Fine nap of the felt: low-alpha noise drawn by an SVG filter, no image file. */
const FELT_NAP =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.96 0 0 0 0 0.93 0.05 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Ground of the Lois des Norms pages: full-bleed felt under the site header,
 * ending above the fixed footer, with the pages' own theme.
 */
const FeltScene = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={ldnTheme}>
    <Box
      component="main"
      sx={{
        backgroundColor: colors.felt,
        backgroundImage: FELT_NAP,
        color: colors.ink,
        colorScheme: "dark",
        fontFamily: fonts.ui,
        fontVariantNumeric: "tabular-nums",
        caretColor: colors.amber,
        scrollbarColor: `${colors.inkLine} ${colors.feltDeep}`,
        // Site header: 56px on phones, 64px on tablets, about 69px on desktop. Footer strip: 56px.
        minHeight: {
          xs: "calc(100dvh - 112px)",
          sm: "calc(100dvh - 120px)",
          md: "calc(100dvh - 125px)",
        },
        "& *, & *::before, & *::after": { boxSizing: "border-box" },
        "& ::selection": { backgroundColor: colors.amber, color: colors.amberInk },
      }}
    >
      <Box
        sx={{
          boxSizing: "border-box",
          maxWidth: sizes.content,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 5 },
          pt: { xs: 2.5, md: 3 },
          pb: { xs: 5, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  </ThemeProvider>
);

export default FeltScene;
