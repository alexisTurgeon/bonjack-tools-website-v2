import { Box, Button, Typography } from "@mui/material";
import CasinoOutlined from "@mui/icons-material/CasinoOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink } from "react-router-dom";
import { LobbySummary } from "../../api/loisDesNorms";
import { lobbyPath, SEAT_COUNT } from "../../helpers/loisDesNorms";
import Nameplate from "./Nameplate";
import PlayMat from "./PlayMat";
import { colors, line, radii } from "./tokens";

interface Props {
  lobby: LobbySummary;
  /** Set only when the lobby can be closed: not main, no game in progress. */
  onClose?: () => void;
  closing?: boolean;
}

const badgeSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  flex: "none",
  px: 1,
  py: 0.5,
  borderRadius: `${radii.badge}px`,
  fontSize: "0.8125rem",
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
} as const;

/** Waiting, or the running loi's number and roll count. */
export const StatusBadge = ({ lobby }: { lobby: Pick<LobbySummary, "gameInProgress" | "gameId" | "rollCount"> }) =>
  lobby.gameInProgress ? (
    <Box component="span" sx={{ ...badgeSx, border: line(colors.card), backgroundColor: colors.card, color: colors.cardInk }}>
      <CasinoOutlined aria-hidden sx={{ fontSize: 16 }} />
      LOI Nº {lobby.gameId} · roll {lobby.rollCount}
    </Box>
  ) : (
    <Box component="span" sx={{ ...badgeSx, border: line(), color: colors.ink }}>
      Waiting
    </Box>
  );

type Seat = { id: string; name?: string | null } | undefined;

/** A row of chairs along one side of the table. */
const SeatRow = ({ seats, offset, side }: { seats: Seat[]; offset: number; side: "top" | "bottom" }) => (
  <Box
    component="ul"
    sx={{
      listStyle: "none",
      m: 0,
      px: 1.5,
      display: "grid",
      // Three chairs on the near side, two centred on the far side.
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      columnGap: 1,
      position: "relative",
      zIndex: 1,
      // The discs sit right against the table's edge.
      ...(side === "top" ? { mb: "-10px" } : { mt: "-10px" }),
    }}
  >
    {seats.map((player, i) => (
      <Box
        component="li"
        key={player?.id || `open-${offset + i}`}
        sx={{ gridColumn: side === "top" ? "span 2" : `${2 + i * 2} / span 2`, minWidth: 0 }}
      >
        {player ? (
          <Nameplate size="sm" name={player.name || player.id} />
        ) : (
          <Nameplate size="sm" empty name="Open seat" />
        )}
      </Box>
    ))}
  </Box>
);

/** One table of the lobby list: a small mat with its five seats around it, then Open and Close. */
const LobbyCard = ({ lobby, onClose, closing }: Props) => {
  // A Go nil slice arrives as null: treat it as no one seated.
  const seated = lobby.players ?? [];
  const seats = Array.from({ length: SEAT_COUNT }, (_, i) => seated[i]);
  const nameId = `lobby-${lobby.id}-name`;

  return (
    <Box
      component="article"
      aria-labelledby={nameId}
      aria-describedby={`${nameId}-seats`}
      sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      <span id={`${nameId}-seats`} hidden>
        {`${seated.length} of ${SEAT_COUNT} seats taken`}
      </span>
      <SeatRow side="top" seats={seats.slice(0, 3)} offset={0} />
      <PlayMat small sx={{ minHeight: 112, display: "flex", flexDirection: "column", gap: 1.25, py: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
          <Typography id={nameId} variant="h2" component="h2" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>
            {lobby.name}
          </Typography>
          <StatusBadge lobby={lobby} />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: colors.inkSoft, fontSize: "0.875rem", mt: "auto" }}>
          <VisibilityOutlined aria-hidden sx={{ fontSize: 18 }} />
          <span>
            {seated.length}/{SEAT_COUNT} seated · {lobby.viewers} watching
          </span>
        </Box>
      </PlayMat>
      <SeatRow side="bottom" seats={seats.slice(3)} offset={3} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 0.5 }}>
        {onClose && (
          <Button variant="text" onClick={onClose} disabled={closing} aria-label={`Close ${lobby.name}`}>
            Close
          </Button>
        )}
        <Button variant="outlined" component={RouterLink} to={lobbyPath(lobby.id)} aria-label={`Open ${lobby.name}`}>
          Open
        </Button>
      </Box>
    </Box>
  );
};

export default LobbyCard;
