import { Box, SelectChangeEvent, Skeleton } from "@mui/material";
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
  /** Full length of the current cooldown, in ms. */
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

/** Five seats then the die tray; on narrow screens the tray comes first. */
const matSx = {
  display: "grid",
  gap: { xs: 1.5, md: 2 },
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    sm: `repeat(auto-fill, minmax(${sizes.seatMinWidth}px, 1fr))`,
  },
  "& > .die-tray": { gridColumn: "1 / -1", gridRow: 1 },
  "@media (min-width: 1280px)": {
    gridTemplateColumns: `repeat(${SEAT_COUNT}, minmax(0, 1fr)) ${sizes.trayWidth}px`,
    "& > .die-tray": { gridColumn: SEAT_COUNT + 1, gridRow: 1 },
  },
} as const;

/** The mat: five seat zones and the die tray. */
const Lobby = (props: LobbyProperties) => (
  <Box sx={matSx}>
    {props.players.map((player, index) => (
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
    <Box className="die-tray">
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
    </Box>
  </Box>
);

/** The mat's outline while the first state is on its way. */
export const LobbySkeleton = () => (
  <Box sx={matSx} aria-busy="true" aria-label="Loading the table">
    {Array.from({ length: SEAT_COUNT }, (_, i) => (
      <Box
        key={i}
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
          sx={{ width: { xs: sizes.tokenCompact, sm: sizes.token }, height: { xs: sizes.tokenCompact, sm: sizes.token } }}
        />
      </Box>
    ))}
    <Box className="die-tray">
      <Box
        sx={{
          border: line(colors.inkRule),
          borderRadius: `${radii.panel}px`,
          height: { xs: 112, sm: 146 },
          "@media (min-width: 1280px)": { height: sizes.seatHeight },
        }}
      />
    </Box>
  </Box>
);

export default Lobby;
