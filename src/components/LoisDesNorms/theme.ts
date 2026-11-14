import "@fontsource-variable/bricolage-grotesque/opsz.css";
import { createTheme } from "@mui/material/styles";
import { colors, fonts, focusRing, line, radii, restingShadow, liftedShadow, motion } from "./tokens";

const focusVisible = { "&.Mui-focusVisible, &:focus-visible": focusRing };

/** Dark theme scoped to the Lois des Norms pages (nested ThemeProvider). */
export const ldnTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: colors.amber, dark: colors.amberEdge, light: colors.amberHover, contrastText: colors.amberInk },
    secondary: { main: colors.ink, contrastText: colors.cardInk },
    error: { main: colors.danger, dark: colors.danger, light: colors.dangerInk, contrastText: "#FFFFFF" },
    warning: { main: colors.amber, contrastText: colors.amberInk },
    info: { main: colors.ink, contrastText: colors.cardInk },
    success: { main: colors.ink, contrastText: colors.cardInk },
    background: { default: colors.felt, paper: colors.feltDeep },
    text: { primary: colors.ink, secondary: colors.inkSoft, disabled: colors.inkFaint },
    divider: colors.inkRule,
    action: {
      hover: colors.inkWash,
      selected: colors.inkWashStrong,
      focus: colors.inkWashStrong,
      disabled: colors.inkFaint,
      disabledBackground: colors.inkWash,
    },
  },
  shape: { borderRadius: radii.control },
  typography: {
    fontFamily: fonts.ui,
    h1: { fontFamily: fonts.display, fontWeight: 700, fontSize: "2.75rem", lineHeight: 1.05, letterSpacing: "-0.02em" },
    h2: { fontFamily: fonts.display, fontWeight: 650, fontSize: "1.375rem", lineHeight: 1.2, letterSpacing: "-0.01em" },
    h3: { fontFamily: fonts.display, fontWeight: 650, fontSize: "1.125rem", lineHeight: 1.25 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radii.control,
          paddingInline: 16,
          transition: `background-color ${motion.quick}ms, border-color ${motion.quick}ms, color ${motion.quick}ms`,
          ...focusVisible,
        },
        containedPrimary: {
          backgroundColor: colors.amber,
          color: colors.amberInk,
          boxShadow: restingShadow,
          "&:hover": { backgroundColor: colors.amberHover, boxShadow: liftedShadow },
        },
        containedError: {
          backgroundColor: colors.danger,
          "&:hover": { backgroundColor: colors.dangerHover },
        },
        outlined: {
          border: line(),
          color: colors.ink,
          "&:hover": { border: line(colors.ink), backgroundColor: colors.inkWash },
          "&.Mui-disabled": { border: line(colors.inkRule) },
        },
        text: {
          color: colors.inkSoft,
          "&:hover": { color: colors.ink, backgroundColor: colors.inkWash },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: focusVisible } },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: {
          color: colors.ink,
          textUnderlineOffset: "0.2em",
          borderRadius: radii.badge,
          "&:focus-visible": focusRing,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.feltDeep,
          border: line(),
          borderRadius: radii.panel,
          boxShadow: `0 24px 48px ${colors.shadow}`,
          fontVariantNumeric: "tabular-nums",
          "& ::selection": { backgroundColor: colors.amber, color: colors.amberInk },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontFamily: fonts.display, fontWeight: 650, fontSize: "1.375rem" } },
    },
    MuiDialogContentText: { styleOverrides: { root: { color: colors.inkSoft } } },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.feltDeep,
          border: line(),
          borderRadius: radii.control,
          boxShadow: `0 16px 32px ${colors.shadow}`,
          scrollbarColor: `${colors.inkLine} ${colors.feltDeep}`,
          fontVariantNumeric: "tabular-nums",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": { backgroundColor: colors.inkWashStrong },
          "&.Mui-selected:hover, &:hover": { backgroundColor: colors.inkWash },
          "&.Mui-focusVisible": { backgroundColor: colors.inkWashStrong, outline: line(colors.ink), outlineOffset: -2 },
          "&.Mui-disabled": { opacity: 0.6 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.control,
          "& .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: colors.inkLine },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.ink },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2, borderColor: colors.ink },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { color: colors.inkSoft, "&.Mui-focused": { color: colors.ink } } },
    },
    MuiFormHelperText: { styleOverrides: { root: { color: colors.inkSoft } } },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: colors.ink, height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          color: colors.inkSoft,
          minHeight: 44,
          "&.Mui-selected": { color: colors.ink },
          "&.Mui-focusVisible": { ...focusRing, outlineOffset: -4, borderRadius: radii.control },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: line(),
          borderRadius: radii.panel,
          backgroundColor: colors.feltDeep,
          color: colors.ink,
          alignItems: "center",
        },
        standardWarning: { borderColor: colors.amber, "& .MuiAlert-icon": { color: colors.amber } },
        standardError: { borderColor: colors.dangerInk, "& .MuiAlert-icon": { color: colors.dangerInk } },
        standardInfo: { "& .MuiAlert-icon": { color: colors.ink } },
        standardSuccess: { "& .MuiAlert-icon": { color: colors.ink } },
      },
    },
    MuiSkeleton: { styleOverrides: { root: { backgroundColor: colors.inkWash } } },
    MuiCircularProgress: { defaultProps: { color: "inherit" } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: colors.card, color: colors.cardInk, fontSize: "0.8125rem", borderRadius: radii.badge },
      },
    },
  },
});
