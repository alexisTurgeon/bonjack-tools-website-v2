import type { CSSProperties } from "react";
import { LeagueOfLegendsRole } from "../../helpers/loisDesNorms";

/** Design tokens of the Lois des Norms pages. Their colours, frame, fonts and sizes all come from here. */
export const colors = {
  /** Page ground, deepest. Also the footer's ground. */
  void: "#010A13",
  /** Panels and the ground's upper tone. */
  navy: "#0A1428",
  /** Raised panels, hover. */
  navyRaised: "#0F1E36",
  /** Gold frame, light and dark ends. */
  gold: "#C8AA6E",
  goldDark: "#785A28",
  /** Gold for text and the focused row (readable on navy). */
  goldText: "#D9BE85",
  /** Main text. */
  cream: "#F0E6D2",
  /** Secondary text. */
  muted: "#A09B8C",
  /** Hairlines between rows of data. */
  rule: "rgba(200, 170, 110, 0.22)",
  /** Timer and live state. */
  cyan: "#0AC8B9",
  cyanDark: "#0397AB",
  /** Rule circles. */
  red: "#C8304A",
  redText: "#F08A99",
  /** Destructive confirm only. */
  danger: "#B3262F",
  dangerHover: "#C9343D",
  shadow: "rgba(0, 4, 10, 0.6)",
} as const;

/** Used on role frames and role labels only. */
export const roleColors: Record<LeagueOfLegendsRole, string> = {
  TOP: "#7EB6F2",
  JUNGLE: "#A9D45F",
  MID: "#C59BF5",
  ADC: "#F69B93",
  SUPPORT: "#5ED6C8",
};

/** Width of every gold frame line, in px. */
export const FRAME = 2;

/** The one gold frame: a 2px border shading from light gold at the top to dark gold at the bottom. */
export const goldFrame = {
  border: `${FRAME}px solid transparent`,
  borderImage: `linear-gradient(180deg, ${colors.gold}, ${colors.goldDark}) 1`,
} as const;

/** The one bevel: a dark inner line and a faint light line along the top edge. */
export const bevel = `inset 0 0 0 1px ${colors.void}, inset 0 2px 0 rgba(240, 230, 210, 0.08)`;

export const fonts = {
  /** Tracked capital serif: names, headings, the timer. */
  display: '"Cinzel Variable", "Times New Roman", serif',
  /** Italic serif for the focused champion's name. */
  italic: '"Cormorant Garamond Variable", "Times New Roman", serif',
  ui: '"Roboto", "Helvetica", "Arial", sans-serif',
  /** Data: stats, patch, timers in the log. */
  mono: '"JetBrains Mono Variable", ui-monospace, "SFMono-Regular", Menlo, monospace',
} as const;

/** Tracking for capital serif text. */
export const caps = { fontFamily: fonts.display, textTransform: "uppercase", letterSpacing: "0.08em" } as const;

export const sizes = {
  /** Seat row portrait. */
  portrait: 92,
  portraitCompact: 72,
  seatRow: 104,
  roleFrame: 36,
  /** Centre splash ring. */
  ring: 300,
  ringCompact: 220,
  thumb: 48,
  benchSquare: 34,
  disc: 30,
  discSmall: 26,
  leftColumn: 380,
  rightColumn: 340,
  content: 1440,
} as const;

export const motion = {
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  quick: 150,
  routine: 220,
  /** Gold flash running down the five rows. */
  sweep: 700,
  /** One portrait swapping in. */
  swap: 420,
  /** Delay between two seats swapping on a roll. */
  stagger: 120,
  /** Centre splash cross-fade. */
  crossFade: 600,
} as const;

/** Focus ring on the navy ground. */
export const focusRing = {
  outline: `${FRAME}px solid ${colors.cyan}`,
  outlineOffset: 3,
} as const;

/** Off screen, still read by screen readers. */
export const visuallyHidden: CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
};
