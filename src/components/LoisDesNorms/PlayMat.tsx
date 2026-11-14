import { ReactNode } from "react";
import { Box, SxProps, Theme } from "@mui/material";
import { matNap } from "./felt";
import { colors, dashedLine, radii } from "./tokens";

interface Props {
  children: ReactNode;
  /** A table on the lobby list rather than the full lobby mat. */
  small?: boolean;
  sx?: SxProps<Theme>;
}

/** A felt play mat lying on the table: its own nap, a stitched edge and a resting shadow. */
const PlayMat = ({ children, small, sx }: Props) => {
  const radius = small ? radii.panel + 2 : radii.mat;
  const inset = small ? 5 : 7;
  return (
    <Box
      sx={[
        {
          position: "relative",
          backgroundColor: colors.felt,
          ...matNap,
          borderRadius: `${radius}px`,
          boxShadow: `0 3px 3px rgba(3, 14, 9, 0.55), 0 18px 34px ${colors.shadow}`,
          p: small ? 2 : { xs: 1.75, sm: 3 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset,
            borderRadius: `${radius - inset}px`,
            border: dashedLine("rgba(241, 244, 236, 0.3)"),
            pointerEvents: "none",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

export default PlayMat;
