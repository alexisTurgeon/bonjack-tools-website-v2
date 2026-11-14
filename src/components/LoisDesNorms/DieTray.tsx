import { Box, Button, ButtonBase, Typography } from "@mui/material";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import Countdown from "react-countdown";
import { highlightAnimation, REDUCED, tumble } from "./motion";
import { colors, focusRing, fonts, line, liftedShadow, motion, radii, restingShadow, sizes } from "./tokens";

interface Props {
  rollCount: number;
  gameInProgress: boolean;
  canRoll: boolean;
  /** Remaining cooldown in ms when the last state arrived. */
  nextRollTimer: number;
  /** Epoch ms at which the next roll becomes available. */
  nextRollAt: number;
  /** Full length of the current cooldown, in ms. */
  cooldownTotalMs: number;
  /** Changes on every roll seen live; 0 means no roll seen since the page opened. */
  rollSeq: number;
  roll: () => void;
  reset: () => void;
  cancel: () => void;
}

const clockOf = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

/** The cooldown as a track: the filled length is the share of the cooldown still to wait. */
const CooldownTrack = ({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) => {
  const fraction = totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 0;
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        aria-hidden
        sx={{
          position: "relative",
          height: 12,
          borderRadius: `${radii.round}px`,
          border: line(),
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: colors.inkSoft,
            transformOrigin: "left center",
            transform: `scaleX(${fraction})`,
            // Countdown ticks once a second; glide between ticks.
            transition: "transform 1s linear",
            [REDUCED]: { transition: "none" },
          }}
        />
      </Box>
      <Typography role="timer" sx={{ mt: 1, fontSize: "0.9375rem", color: colors.inkSoft }}>
        Next roll in{" "}
        <Box component="span" sx={{ color: colors.ink, fontWeight: 600, display: "inline-block", minWidth: "4ch" }}>
          {clockOf(remainingMs)}
        </Box>
      </Typography>
    </Box>
  );
};

const statusText = (gameInProgress: boolean, canRoll: boolean) => {
  if (canRoll) return gameInProgress ? "Ready to roll" : "The first roll starts the loi";
  return gameInProgress ? "Waiting for the server" : "Start is not available yet";
};

/** Roll die, cooldown track, and Finish and Cancel while a game runs. */
const DieTray = (props: Props) => {
  const { rollCount, gameInProgress, canRoll, nextRollTimer, nextRollAt, cooldownTotalMs, rollSeq } = props;
  const label = gameInProgress ? "Roll" : "Start";
  const coolingDown = !canRoll && nextRollTimer > 0;

  return (
    <Box
      component="section"
      aria-label="Roll controls"
      sx={{
        border: line(),
        borderRadius: `${radii.panel}px`,
        backgroundColor: colors.feltDeep,
        p: { xs: 1.5, sm: 2 },
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: { xs: 2, sm: 2.5 },
        "@media (min-width: 1280px)": {
          flexDirection: "column",
          alignItems: "stretch",
          height: sizes.seatHeight,
          gap: 2,
        },
      }}
    >
      <ButtonBase
        onClick={props.roll}
        disabled={!canRoll}
        aria-label={label}
        sx={{
          flex: "none",
          alignSelf: "center",
          width: { xs: sizes.dieCompact, sm: sizes.die },
          height: { xs: sizes.dieCompact, sm: sizes.die },
          borderRadius: `${radii.die}px`,
          "&.Mui-focusVisible, &:focus-visible": { ...focusRing, outlineOffset: 4 },
          "& .die-body": {
            backgroundColor: colors.amber,
            color: colors.amberInk,
            border: line(colors.amberEdge),
            boxShadow: restingShadow,
            transition: `transform ${motion.quick}ms ${motion.easeOut}, box-shadow ${motion.quick}ms`,
          },
          "&:hover .die-body": { transform: "translateY(-2px)", boxShadow: liftedShadow },
          "&:active .die-body": { transform: "translateY(1px)", boxShadow: restingShadow },
          "&.Mui-disabled .die-body": {
            backgroundColor: "rgba(242, 169, 59, 0.12)",
            color: colors.amber,
            boxShadow: "none",
            transform: "none",
          },
        }}
      >
        <Box
          key={rollSeq}
          className="die-body"
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: `${radii.die}px`,
            display: "grid",
            placeItems: "center",
            alignContent: "center",
            gap: 0.25,
            animation: rollSeq > 0 ? `${tumble} ${motion.tumble}ms ${motion.easeOut} both` : "none",
            [REDUCED]: { animation: rollSeq > 0 ? highlightAnimation : "none" },
          }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 750,
              fontSize: { xs: "2.25rem", sm: "3rem" },
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {rollCount}
          </Box>
          <Box component="span" sx={{ fontSize: { xs: "0.75rem", sm: "0.8125rem" }, fontWeight: 700, letterSpacing: "0.06em" }}>
            {label.toUpperCase()}
          </Box>
        </Box>
      </ButtonBase>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "@media (min-width: 1280px)": { flex: 1, justifyContent: "space-between" },
        }}
      >
        {coolingDown ? (
          <Countdown
            key={nextRollAt}
            date={nextRollAt}
            renderer={({ total }) => <CooldownTrack remainingMs={total} totalMs={cooldownTotalMs} />}
          />
        ) : (
          <Typography sx={{ fontSize: "0.9375rem", color: canRoll ? colors.ink : colors.inkSoft, fontWeight: canRoll ? 600 : 400 }}>
            {statusText(gameInProgress, canRoll)}
          </Typography>
        )}
        {gameInProgress && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              "@media (min-width: 1280px)": { flexDirection: "column", flexWrap: "nowrap" },
            }}
          >
            <Button variant="outlined" startIcon={<FlagOutlined />} onClick={props.reset}>
              Finish
            </Button>
            <Button variant="text" onClick={props.cancel}>
              Cancel
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DieTray;
