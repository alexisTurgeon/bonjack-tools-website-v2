import { ReactNode } from "react";
import { Box, SelectChangeEvent, Skeleton, useMediaQuery } from "@mui/material";
import { AvailablePlayers, Player, SEAT_COUNT } from "../../helpers/loisDesNorms";
import DieTray from "./DieTray";
import PlayerInfo from "./PlayerInfo";
import { colors, line, motion, radii, sizes } from "./tokens";

export interface LobbyProperties {
  rollCount: number;
  players: Player[];
  availablePlayers: AvailablePlayers;
  leagueVersion: string;
  /** False between games: only Start is shown. Cancel, Finish and Roll need a game. */
  gameInProgress: boolean;
  canRoll: boolean;
  /** Remaining cooldown in ms when the last state arrived. */
  nextRollTimer: number;
  /** Epoch ms at which the next roll becomes available. */
  nextRollAt: number;
  /** Full length of the cooldown between two rolls, in ms. */
  cooldownTotalMs: number;
  /** Changes on every roll seen live. */
  rollSeq: number;
  /** Per seat, changes when a player is seated there. */
  seatDrops: number[];
  reset: () => void;
  roll: () => void;
  cancel: () => void;
  onPlayerChange: (event: SelectChangeEvent, index: number) => void;
}

/** From this width the tray sits right of the seats; below it, above them. */
const WIDE = "(min-width: 1280px)";

const matSx = {
  display: "grid",
  gap: 1.5,
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: `repeat(auto-fill, minmax(${sizes.seatMinWidth}px, 1fr))`,
  },
  "& > .die-tray": { gridColumn: "1 / -1" },
  [`@media ${WIDE}`]: {
    gridTemplateColumns: `repeat(${SEAT_COUNT}, minmax(0, 1fr)) ${sizes.trayWidth}px`,
    "& > .die-tray": { gridColumn: "auto" },
  },
} as const;

/** Seats and tray in reading order: the DOM order follows the layout, not CSS order. */
const MatGrid = ({ tray, seats, label }: { tray: ReactNode; seats: ReactNode; label?: string }) => {
  const wide = useMediaQuery(WIDE, { noSsr: true });
  return (
    <Box sx={matSx} aria-busy={label ? "true" : undefined} aria-label={label}>
      {!wide && <Box className="die-tray">{tray}</Box>}
      {seats}
      {wide && <Box className="die-tray">{tray}</Box>}
    </Box>
  );
};

/** The mat: five seat zones and the die tray. */
const Lobby = (props: LobbyProperties) => (
  <MatGrid
    tray={
      <DieTray
        rollCount={props.rollCount}
        gameInProgress={props.gameInProgress}
        canRoll={props.canRoll}
        nextRollTimer={props.nextRollTimer}
        nextRollAt={props.nextRollAt}
        cooldownTotalMs={props.cooldownTotalMs}
        rollSeq={props.rollSeq}
        roll={props.roll}
        reset={props.reset}
        cancel={props.cancel}
      />
    }
    seats={props.players.map((player, index) => (
      <PlayerInfo
        key={`seat-${index}`}
        index={index}
        seat={player}
        availablePlayers={props.availablePlayers}
        leagueVersion={props.leagueVersion}
        onChange={props.onPlayerChange}
        flipKey={props.rollSeq}
        flipDelay={motion.flipLead + index * motion.flipStagger}
        dropKey={props.seatDrops[index] ?? 0}
      />
    ))}
  />
);

const SEAT_INDEXES = Array.from({ length: SEAT_COUNT }, (_, i) => i);

const SeatSkeleton = () => (
  <Box
    sx={{
      border: line(colors.inkRule),
      borderRadius: `${radii.panel}px`,
      height: { xs: sizes.seatHeightCompact, sm: sizes.seatHeight },
      p: 1.5,
      display: "grid",
      placeItems: "center",
    }}
  >
    <Skeleton
      variant="circular"
      sx={{
        width: { xs: sizes.tokenCompact, sm: sizes.token },
        height: { xs: sizes.tokenCompact, sm: sizes.token },
      }}
    />
  </Box>
);

/** The mat's outline while the first state is on its way. */
export const LobbySkeleton = () => (
  <MatGrid
    label="Loading the table"
    tray={
      <Box
        sx={{
          border: line(colors.inkRule),
          borderRadius: `${radii.panel}px`,
          height: { xs: 112, sm: 146 },
          [`@media ${WIDE}`]: { height: sizes.seatHeight },
        }}
      />
    }
    seats={SEAT_INDEXES.map((i) => (
      <SeatSkeleton key={i} />
    ))}
  />
);

export default Lobby;
