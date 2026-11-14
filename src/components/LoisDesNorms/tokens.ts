import type { CSSProperties } from "react";
import { LeagueOfLegendsRole } from "../../helpers/loisDesNorms";

/** Design tokens of the Lois des Norms pages. Their colours, radii, line and sizes all come from here. */
export const colors = {
  /** Page ground. */
  felt: "#11392A",
  /** Recessed felt: the die tray well, menus and dialogs. */
  feltDeep: "#0B2A1F",
  /** Raised felt: lobby tiles. */
  feltRaised: "#164433",
  /** Text and printed lines. */
  ink: "#F1F4EC",
  /** Secondary text, tinted green. */
  inkSoft: "#C3D5C8",
  /** Quiet text (open seats, disabled): still AA on every felt tone. */
  inkFaint: "#A3C0AE",
  /** Printed lines. */
  inkLine: "rgba(241, 244, 236, 0.58)",
  /** Hairline rules inside a panel (same weight, lower contrast). */
  inkRule: "rgba(241, 244, 236, 0.22)",
  inkWash: "rgba(241, 244, 236, 0.08)",
  inkWashStrong: "rgba(241, 244, 236, 0.14)",
  /** Cardboard: token backs and initial discs. */
  card: "#EDE6D3",
  cardInk: "#173F2F",
  /** Primary action only: the die and New lobby. */
  amber: "#F2A93B",
  amberHover: "#F6BA5E",
  amberEdge: "#B8741A",
  amberInk: "#2E1B03",
  /** Destructive confirm only. */
  danger: "#B3362B",
  dangerHover: "#C4443A",
  /** Error text on felt. */
  dangerInk: "#FFB4A9",
  shadow: "rgba(4, 18, 12, 0.55)",
} as const;

/** Used on token rims and role chips only. */
export const roleColors: Record<LeagueOfLegendsRole, string> = {
  TOP: "#7EB6F2",
  JUNGLE: "#A9D45F",
  MID: "#C59BF5",
  ADC: "#F28B82",
  SUPPORT: "#5ED6C8",
};

/** Line weight of every printed line, in px. */
export const LINE = 2;
export const line = (color: string = colors.inkLine) => `${LINE}px solid ${color}`;
export const dashedLine = (color: string = colors.inkLine) => `${LINE}px dashed ${color}`;

/** Corner radii, scaled by the size of the piece. */
export const radii = {
  /** Tiles, seat zones, the die tray, the rules screen, dialogs. */
  panel: 14,
  /** Buttons, inputs, menus. */
  control: 10,
  /** Badges and chips. */
  badge: 6,
  /** The die. */
  die: 22,
  round: 999,
} as const;

/** Spacing steps, in px. */
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 40 } as const;

export const fonts = {
  display: '"Bricolage Grotesque Variable", "Roboto", "Helvetica", "Arial", sans-serif',
  ui: '"Roboto", "Helvetica", "Arial", sans-serif',
} as const;

/** Fixed sizes: a seat keeps its size in every state. */
export const sizes = {
  token: 112,
  tokenCompact: 72,
  seatHeight: 300,
  seatHeightCompact: 112,
  seatMinWidth: 176,
  die: 112,
  dieCompact: 84,
  trayWidth: 200,
  disc: 32,
  discSmall: 26,
  content: 1440,
} as const;

/** Soft offset shadow of a piece resting on the felt. */
export const restingShadow = `0 6px 12px ${colors.shadow}`;
export const liftedShadow = `0 12px 22px ${colors.shadow}`;

export const motion = {
  /** Confident arrival. */
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  quick: 150,
  routine: 220,
  tumble: 560,
  flip: 480,
  /** Delay between two seats flipping on a roll. */
  flipStagger: 130,
  /** Delay before the first token flips, while the die tumbles. */
  flipLead: 240,
  drop: 320,
} as const;

/** Focus ring on the felt. */
export const focusRing = {
  outline: `${LINE}px solid ${colors.ink}`,
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
