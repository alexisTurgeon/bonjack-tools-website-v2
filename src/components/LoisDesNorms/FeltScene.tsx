import { ReactNode } from "react";
import { Box, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { tableNap } from "./felt";
import { ldnTheme } from "./theme";
import { colors, line, sizes } from "./tokens";

/**
 * While these pages are mounted: the site's fixed footer gets the table's
 * ground and ink text, and #root drops its footer gap (the scene keeps its
 * own, at least the footer's height).
 */
const footerStyles = {
  "#root": { paddingBottom: 0 },
  ".footer": {
    backgroundColor: colors.table,
    color: colors.ink,
    borderTop: line(colors.inkRule),
    padding: "6px 16px",
    boxSizing: "border-box",
  },
  ".footer .MuiTypography-root": { color: colors.ink, fontSize: "0.875rem" },
} as const;

/** The table: full-bleed felt under the site header, with the pages' own theme. */
const FeltScene = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={ldnTheme}>
    <GlobalStyles styles={footerStyles} />
    <Box
      component="main"
      sx={{
        backgroundColor: colors.table,
        ...tableNap,
        color: colors.ink,
        colorScheme: "dark",
        fontVariantNumeric: "tabular-nums",
        caretColor: colors.amber,
        scrollbarColor: `${colors.inkLine} ${colors.table}`,
        // Site header: 56px on phones, 64px on tablets, about 69px on desktop.
        minHeight: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)", md: "calc(100dvh - 69px)" },
        "& *, & *::before, & *::after": { boxSizing: "border-box" },
        "& ::selection": { backgroundColor: colors.amber, color: colors.amberInk },
      }}
    >
      <Box
        sx={{
          boxSizing: "border-box",
          maxWidth: sizes.content,
          mx: "auto",
          px: { xs: 1.5, sm: 3 },
          pt: { xs: 2, md: 2.5 },
          // Clear of the fixed footer (about 36px) with room to spare.
          pb: { xs: 9, md: 8 },
        }}
      >
        {children}
      </Box>
    </Box>
  </ThemeProvider>
);

export default FeltScene;
