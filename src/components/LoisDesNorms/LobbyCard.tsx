import { Box, Button, Typography } from "@mui/material";
import CasinoOutlined from "@mui/icons-material/CasinoOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink } from "react-router-dom";
import { LobbySummary } from "../../api/loisDesNorms";
import { lobbyPath, SEAT_COUNT } from "../../helpers/loisDesNorms";
import Nameplate from "./Nameplate";
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

/** One table of the lobby list: name, status, the five seats, viewers, Open and Close. */
const LobbyCard = ({ lobby, onClose, closing }: Props) => {
  // A Go nil slice arrives as null: treat it as no one seated.
  const seated = lobby.players ?? [];
  const seats = Array.from({ length: SEAT_COUNT }, (_, i) => seated[i]);
  const nameId = `lobby-${lobby.id}-name`;

  return (
    <Box
      component="article"
      aria-labelledby={nameId}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: { xs: 2, sm: 2.5 },
        border: line(),
        borderRadius: `${radii.panel}px`,
        backgroundColor: colors.feltRaised,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Typography id={nameId} variant="h2" component="h2" sx={{ overflowWrap: "anywhere", minWidth: 0 }}>
          {lobby.name}
        </Typography>
        <StatusBadge lobby={lobby} />
      </Box>
      <Box
        component="ul"
        aria-label={`Seats, ${seated.length} of ${SEAT_COUNT} taken`}
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "10px 16px",
        }}
      >
        {seats.map((player, index) => (
          <li key={player?.id || `open-${index}`}>
            {player ? (
              <Nameplate size="sm" name={player.name || player.id} />
            ) : (
              <Nameplate size="sm" empty name="Open seat" />
            )}
          </li>
        ))}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: "auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            color: colors.inkSoft,
            fontSize: "0.875rem",
          }}
        >
          <VisibilityOutlined aria-hidden sx={{ fontSize: 18 }} />
          <span>
            {seated.length}/{SEAT_COUNT} seated · {lobby.viewers} watching
          </span>
        </Box>
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          {onClose && (
            <Button
              variant="text"
              onClick={onClose}
              disabled={closing}
              aria-label={`Close ${lobby.name}`}
            >
              Close
            </Button>
          )}
          <Button
            variant="outlined"
            component={RouterLink}
            to={lobbyPath(lobby.id)}
            aria-label={`Open ${lobby.name}`}
          >
            Open
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LobbyCard;
