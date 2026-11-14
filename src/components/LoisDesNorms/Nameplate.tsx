import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { initialOf } from "../../helpers/loisDesNorms";
import { colors, dashedLine, fonts, sizes } from "./tokens";

interface DiscProps {
  name?: string | null;
  size?: number;
  /** An open seat: printed outline, no letter. */
  empty?: boolean;
}

/** Cardboard disc with the player's initial. */
export const InitialDisc = ({ name, size = sizes.disc, empty }: DiscProps) => (
  <Box
    aria-hidden
    sx={{
      width: size,
      height: size,
      flex: "none",
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      fontFamily: fonts.display,
      fontWeight: 750,
      fontSize: Math.round(size * 0.47),
      lineHeight: 1,
      ...(empty
        ? { border: dashedLine(colors.inkLine) }
        : {
            backgroundColor: colors.card,
            color: colors.cardInk,
            boxShadow: `0 2px 4px ${colors.shadow}`,
          }),
    }}
  >
    {empty ? null : initialOf(name)}
  </Box>
);

interface NameplateProps {
  name: ReactNode;
  /** Name used for the initial when `name` is not plain text; null for a player without a name. */
  initialFrom?: string | null;
  /** One-line stat note, e.g. "12 games · 31 rolls". */
  note?: ReactNode;
  /** Keep the note line's height even without a note, so the plate never changes size. */
  reserveNote?: boolean;
  size?: "md" | "sm";
  empty?: boolean;
  /** Room kept free at the end of the name line (px), e.g. for a select's chevron. */
  reserveEnd?: number;
}

/** The one way a player is shown: initial disc, name, stat note. */
const Nameplate = ({ name, initialFrom, note, reserveNote, size = "md", empty, reserveEnd = 0 }: NameplateProps) => {
  const small = size === "sm";
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <InitialDisc
        name={initialFrom !== undefined ? initialFrom : typeof name === "string" ? name : undefined}
        size={small ? sizes.discSmall : sizes.disc}
        empty={empty}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          component="span"
          noWrap
          sx={{
            display: "block",
            fontWeight: empty ? 400 : 500,
            fontSize: small ? "0.875rem" : "0.9375rem",
            lineHeight: 1.35,
            color: empty ? colors.inkFaint : colors.ink,
            pr: `${reserveEnd}px`,
          }}
        >
          {name}
        </Typography>
        {(note !== undefined || reserveNote) && (
          <Typography
            component="span"
            noWrap
            sx={{ display: "block", fontSize: "0.8125rem", lineHeight: 1.35, color: colors.inkSoft }}
          >
            {note ?? "\u00a0"}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Nameplate;
