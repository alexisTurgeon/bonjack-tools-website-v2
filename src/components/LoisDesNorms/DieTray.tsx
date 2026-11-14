import { Box, Button, ButtonBase, Typography } from "@mui/material";
import FlagOutlined from "@mui/icons-material/FlagOutlined";
import Countdown from "react-countdown";
import Die from "./Die";
import { highlightAnimation, REDUCED } from "./motion";
import { colors, focusRing, line, motion, radii, sizes } from "./tokens";

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
          position: "relative",
          flex: "none",
          alignSelf: "center",
          width: { xs: sizes.dieCompact, sm: sizes.die },
          p: 0.5,
          borderRadius: `${radii.panel}px`,
          "&.Mui-focusVisible, &:focus-visible": { ...focusRing, outlineOffset: 2 },
          "& > svg": { transition: `transform ${motion.quick}ms ${motion.easeOut}` },
          "&:hover > svg": { transform: "translateY(-2px)" },
          "&:active > svg": { transform: "translateY(1px)" },
        }}
      >
        <Die value={gameInProgress ? rollCount : undefined} dim={!canRoll} rollSeq={rollSeq} />
        {rollSeq > 0 && (
          // Reduced motion: a short ink ring instead of the tumble.
          <Box
            key={rollSeq}
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: `${radii.panel}px`,
              pointerEvents: "none",
              display: "none",
              [REDUCED]: { display: "block", animation: highlightAnimation },
            }}
          />
        )}
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
