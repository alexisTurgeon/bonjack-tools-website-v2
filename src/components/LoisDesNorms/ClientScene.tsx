import { ReactNode, useState } from "react";
import { Box, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { fadeIn, REDUCED } from "./motion";
import { ldnTheme } from "./theme";
import { colors, motion, sizes } from "./tokens";

/**
 * While these pages are mounted: the site's fixed footer keeps its look but
 * gets the page's ground and cream text so it stays legible, and #root drops
 * its footer gap (the scene keeps its own, at least the footer's height).
 */
const footerStyles = {
  "#root": { paddingBottom: 0 },
  ".footer": { backgroundColor: colors.void, color: colors.cream },
  ".footer .MuiTypography-root": { color: colors.cream },
} as const;

const layerSx = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  // Blurred and darkened so the page reads over it; scaled so the blur has no soft edge.
  filter: "blur(16px) brightness(0.34) saturate(1.1)",
  transform: "scale(1.08)",
} as const;

/** The focused champion's splash behind everything, cross-faded when it changes. */
const SplashGround = ({ url }: { url: string }) => {
  // The splash already faded in; it stays underneath while the next one fades in over it.
  const [settled, setSettled] = useState<string | undefined>(undefined);
  return (
    <Box aria-hidden sx={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
      {settled && settled !== url && <Box component="img" src={settled} alt="" sx={layerSx} />}
      <Box
        component="img"
        key={url}
        src={url}
        alt=""
        onAnimationEnd={() => setSettled(url)}
        sx={{
          ...layerSx,
          animation: `${fadeIn} ${motion.crossFade}ms ease-out both`,
          [REDUCED]: { animation: "none" },
        }}
      />
      {/* Vignette into the blue-black ground. */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 70% at 50% 40%, rgba(1, 10, 19, 0.15) 0%, rgba(1, 10, 19, 0.75) 70%, ${colors.void} 100%)`,
        }}
      />
    </Box>
  );
};

/** The champ-select ground: blue-black under the focused champion's blurred splash, with the pages' own theme. */
const ClientScene = ({ children, splash }: { children: ReactNode; splash?: string }) => (
  <ThemeProvider theme={ldnTheme}>
    <GlobalStyles styles={footerStyles} />
    <Box
      component="main"
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        backgroundColor: colors.void,
        backgroundImage: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.void} 75%)`,
        color: colors.cream,
        colorScheme: "dark",
        fontVariantNumeric: "tabular-nums",
        caretColor: colors.gold,
        scrollbarColor: `${colors.goldDark} ${colors.void}`,
        // Site header: 56px on phones, 64px on tablets, about 69px on desktop.
        minHeight: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)", md: "calc(100dvh - 69px)" },
        "& *, & *::before, & *::after": { boxSizing: "border-box" },
        "& ::selection": { backgroundColor: colors.gold, color: colors.void },
      }}
    >
      {splash && <SplashGround url={splash} />}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: sizes.content,
          mx: "auto",
          px: { xs: 1.5, sm: 3 },
          pt: { xs: 2, md: 2 },
          // Clear of the fixed footer (about 24px) with room to spare.
          pb: { xs: 6, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  </ThemeProvider>
);

export default ClientScene;
