import { useEffect, useReducer, useRef, useCallback, useState } from "react";
import { Alert, Box, Button, Link, SelectChangeEvent, Skeleton, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import HeadsetMicOutlined from "@mui/icons-material/HeadsetMicOutlined";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  DEFAULT_LOBBY_ID,
  DEFAULT_ROLL_COOLDOWN_MS,
  emptyDiscordPlayer,
  emptyPlayer,
  LOBBY_LIST_PATH,
  lobbyWebsocketUrl,
  LoisDesNormsState,
  MessageActions,
  Player,
  SEAT_COUNT,
} from "../helpers/loisDesNorms";
import AdditionalInformationBlock from "../components/LoisDesNorms/AdditionalInformationBlock";
import Lobby, { LobbySkeleton } from "../components/LoisDesNorms/Lobby";
import FeltScene from "../components/LoisDesNorms/FeltScene";
import PlayMat from "../components/LoisDesNorms/PlayMat";
import { colors, visuallyHidden } from "../components/LoisDesNorms/tokens";

type Message = { action: MessageActions; content: string };

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30_000;
/** Close code the server uses right after lobbyNotFound. */
const LOBBY_NOT_FOUND_CLOSE_CODE = 4404;

/** Server state plus what the page derives from how it changed. */
interface PageState extends LoisDesNormsState {
  /** Bumped on every roll seen live; drives the die and the token flips. */
  rollSeq: number;
  /** Per seat, bumped when a player is newly seated there; drives the token drop. */
  seatDrops: number[];
  /** Polite announcement of the last roll. */
  announcement: string;
}

const initialState = (lobbyId: string): PageState => ({
  lobbyId,
  lobbyName: "",
  players: Array.from({ length: SEAT_COUNT }, emptyPlayer),
  rollCount: 0,
  gameInProgress: false,
  gameId: -1,
  nextRollTimer: 0,
  nextRollAt: 0,
  canRoll: false,
  availablePlayers: { "": emptyDiscordPlayer() },
  discordGuild: "",
  discordGuildName: "",
  discordGuildChannel: "",
  leagueVersion: "",
  rollSeq: 0,
  seatDrops: Array.from({ length: SEAT_COUNT }, () => 0),
  announcement: "",
});

/** Bump a seat's counter when a player newly sits there. Nothing on the first state. */
const nextSeatDrops = (state: PageState, players: Player[], hadState: boolean): number[] =>
  players.map((seat, i) => {
    const before = state.seatDrops[i] ?? 0;
    const changed = seat.player.id !== "" && seat.player.id !== state.players[i]?.player.id;
    return hadState && changed ? before + 1 : before;
  });

const rollAnnouncement = (state: LoisDesNormsState): string => {
  const draws = state.players
    .filter((seat) => seat.player.id && seat.role && seat.champion)
    .map((seat) => `${seat.player.name ?? "A player"}: ${seat.role}, ${seat.champion?.name}`);
  return `Loi number ${state.gameId}, roll ${state.rollCount}. ${draws.join(". ")}.`;
};

/** Server seats in the client's shape: always SEAT_COUNT seats, never a null player. */
const normalizeSeats = (seats: Player[] | null | undefined): Player[] =>
  Array.from({ length: SEAT_COUNT }, (_, i) => {
    const seat = seats?.[i];
    return seat ? { ...seat, player: seat.player ?? emptyDiscordPlayer() } : emptyPlayer();
  });

const reducer = (state: PageState, message: Message): PageState => {
  switch (message.action) {
    case "updatePlayers": {
      const players = normalizeSeats(JSON.parse(message.content) as Player[]);
      return { ...state, players, seatDrops: nextSeatDrops(state, players, true) };
    }
    case "updateState": {
      // Replaces the whole state, so it also reverts an optimistic updatePlayers
      // the server refused (it echoes the true state back to the sender).
      const newState = JSON.parse(message.content) as LoisDesNormsState;
      const hadState = state.gameId >= 0;
      const timer = newState.nextRollTimer ?? 0;
      // A roll seen live: a new game started, or the roll count went up.
      const rolled =
        hadState &&
        newState.gameInProgress &&
        (newState.gameId !== state.gameId || newState.rollCount > state.rollCount);
      const merged: LoisDesNormsState = {
        ...newState,
        // Additive fields: an older server leaves them out.
        lobbyId: newState.lobbyId ?? state.lobbyId,
        lobbyName: newState.lobbyName ?? "",
        players: normalizeSeats(newState.players),
        nextRollAt: Date.now() + timer,
        availablePlayers: {
          ...Object.fromEntries(Object.entries(newState.availablePlayers ?? {}).filter(([, p]) => p != null)),
          "": emptyDiscordPlayer(),
        },
      };
      return {
        ...merged,
        rollSeq: rolled ? state.rollSeq + 1 : state.rollSeq,
        // A roll replaces every seat's token; the flip shows it, not a drop.
        seatDrops: rolled ? state.seatDrops : nextSeatDrops(state, merged.players, hadState),
        announcement: rolled ? rollAnnouncement(merged) : state.announcement,
      };
    }
    default:
      return state;
  }
};

/** Why the server ended the connection for good: no reconnect after either. */
type LobbyGoneReason = "notFound" | "closed";

type ConnectionStatus =
  | { kind: "connecting"; attempt: number }
  | { kind: "open" }
  | { kind: "closed"; attempt: number; retryInMs: number }
  | { kind: "gone"; reason: LobbyGoneReason };

const BackLink = () => (
  <Link
    component={RouterLink}
    to={LOBBY_LIST_PATH}
    sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, color: colors.inkSoft, fontWeight: 500 }}
  >
    <ArrowBackRounded aria-hidden sx={{ fontSize: 20 }} />
    All lobbies
  </Link>
);

const headlineSx = { fontSize: { xs: "2.125rem", md: "2.75rem" }, overflowWrap: "anywhere" } as const;

const LoisDesNormsLobby = ({ lobbyId }: { lobbyId: string }) => {
  const [state, dispatch] = useReducer(reducer, lobbyId, initialState);
  const [connection, setConnection] = useState<ConnectionStatus>({ kind: "connecting", attempt: 1 });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Unmounted (the page is keyed by lobby id, so this also covers a lobby switch).
    let disposed = false;
    // The server said the lobby does not exist or was closed.
    let gone = false;
    let retryDelay = INITIAL_RETRY_MS;
    let attempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const stop = (ws: WebSocket, reason: LobbyGoneReason) => {
      gone = true;
      clearTimeout(retryTimer);
      setConnection({ kind: "gone", reason });
      ws.close();
    };

    const connect = () => {
      if (disposed || gone) return;
      attempt += 1;
      setConnection({ kind: "connecting", attempt });
      const ws = new WebSocket(lobbyWebsocketUrl(lobbyId));
      wsRef.current = ws;

      ws.onopen = () => {
        retryDelay = INITIAL_RETRY_MS;
        setConnection({ kind: "open" });
      };
      ws.onmessage = (event) => {
        if (disposed || gone) return;
        try {
          const msg = JSON.parse(event.data) as Message;
          if (msg.action === "lobbyNotFound") stop(ws, "notFound");
          else if (msg.action === "lobbyClosed") stop(ws, "closed");
          else if (msg.action) dispatch(msg);
        } catch (err) {
          console.error("Invalid websocket message", err);
        }
      };
      ws.onerror = (err) => {
        console.error("Socket encountered error, closing", err);
        ws.close();
      };
      ws.onclose = (evt) => {
        if (wsRef.current === ws) wsRef.current = null;
        if (disposed || gone) return;
        if (evt.code === LOBBY_NOT_FOUND_CLOSE_CODE) {
          // The lobbyNotFound message got lost; the close code says the same thing.
          gone = true;
          setConnection({ kind: "gone", reason: "notFound" });
          return;
        }
        console.warn(
          `Socket closed (${evt.reason || evt.code}). Reconnecting in ${retryDelay / 1000}s`
        );
        setConnection({ kind: "closed", attempt, retryInMs: retryDelay });
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
      };
    };

    connect();
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [lobbyId]);

  /** False when the socket is not open and the action was dropped. */
  const send = useCallback((action: string, content?: string): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`Socket not open, dropping action "${action}"`);
      return false;
    }
    ws.send(JSON.stringify({ action, content }));
    return true;
  }, []);

  const reset = () => send("reset");
  const roll = () => send("roll");
  const cancel = () => send("cancel");

  const onPlayerChange = (event: SelectChangeEvent, index: number) => {
    const newId = event.target.value;
    const current = state.players[index];
    if (newId === current.player.id) return;

    const players = state.players.map((p) => ({ ...p, player: { ...p.player } }));
    // Picking an already-seated player swaps the two seats. Picking "empty" just
    // clears this seat; it must never move the current player somewhere else.
    const swapIndex = newId === "" ? -1 : players.findIndex((p) => p.player.id === newId);
    if (swapIndex >= 0) {
      players[swapIndex].player = { ...current.player };
    }
    players[index].player = {
      id: newId,
      name: state.availablePlayers[newId]?.name,
    };

    // Optimistic: applied only once sent. If the server refuses the seat (the
    // player is in a game in another lobby), its updateState reverts it.
    if (send("updatePlayers", JSON.stringify(players.map((p) => p.player)))) {
      dispatch({ action: "updatePlayers", content: JSON.stringify(players) });
    }
  };

  if (connection.kind === "gone") {
    return (
      <FeltScene>
        <BackLink />
        <Typography variant="h1" component="h1" sx={{ ...headlineSx, mt: 2, mb: 3 }}>
          {connection.reason === "notFound" ? "No such lobby" : "Lobby closed"}
        </Typography>
        <Alert
          severity="warning"
          action={
            <Button variant="outlined" component={RouterLink} to={LOBBY_LIST_PATH} sx={{ whiteSpace: "nowrap" }}>
              All lobbies
            </Button>
          }
        >
          {connection.reason === "notFound"
            ? "This lobby does not exist. It may have been closed."
            : "This lobby was closed. Its seats are free again."}
        </Alert>
      </FeltScene>
    );
  }

  const connectionBanner =
    connection.kind === "open" ? null : (
      <Alert severity={connection.kind === "closed" ? "warning" : "info"} sx={{ mb: 2.5 }}>
        {connection.kind === "closed"
          ? `Connection lost. Retrying in ${Math.round(connection.retryInMs / 1000)}s (attempt ${connection.attempt})…`
          : connection.attempt === 1
            ? "Connecting to the game server…"
            : `Connecting to the game server (attempt ${connection.attempt})…`}
      </Alert>
    );

  const loaded = state.gameId >= 0;
  const lobbyName = state.lobbyName || lobbyId;

  return (
    <FeltScene>
      <BackLink />
      <PlayMat sx={{ mt: 1.5 }}>
      <Box
        component="header"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          columnGap: 3,
          rowGap: 1,
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        {loaded ? (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" component="h1" sx={headlineSx}>
              {state.gameInProgress ? `LOI Nº ${state.gameId}` : lobbyName}
            </Typography>
            <Typography sx={{ color: colors.inkSoft, mt: 0.75, overflowWrap: "anywhere" }}>
              {state.gameInProgress ? `${lobbyName} · in game` : "Waiting for the first roll"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: 280 }}>
            <Skeleton variant="text" sx={{ fontSize: "3rem" }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        )}
        {loaded && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: colors.inkSoft, fontSize: "0.9375rem" }}>
            <HeadsetMicOutlined aria-hidden sx={{ fontSize: 20 }} />
            <span>
              {state.discordGuildName || state.discordGuild}
              {state.discordGuildChannel ? ` · ${state.discordGuildChannel}` : ""}
            </span>
          </Box>
        )}
      </Box>
      {connectionBanner}
      {loaded ? (
        <Lobby
          rollCount={state.rollCount}
          players={state.players}
          availablePlayers={state.availablePlayers}
          gameInProgress={state.gameInProgress}
          canRoll={state.canRoll}
          nextRollTimer={state.nextRollTimer}
          nextRollAt={state.nextRollAt}
          cooldownTotalMs={state.rollCooldownMs ?? DEFAULT_ROLL_COOLDOWN_MS}
          rollSeq={state.rollSeq}
          seatDrops={state.seatDrops}
          leagueVersion={state.leagueVersion}
          reset={reset}
          roll={roll}
          cancel={cancel}
          onPlayerChange={onPlayerChange}
        />
      ) : (
        <LobbySkeleton />
      )}
      </PlayMat>
      {loaded && (
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <AdditionalInformationBlock availablePlayers={state.availablePlayers} />
        </Box>
      )}
      <div aria-live="polite" style={visuallyHidden}>
        {state.announcement}
      </div>
    </FeltScene>
  );
};

/**
 * One lobby at /lois-des-norms/:lobbyId. Keyed by the id so switching lobbies
 * remounts it: fresh reducer state, and the old socket and retry timer are
 * disposed by the effect cleanup.
 */
const LoisDesNorms = () => {
  const { lobbyId = DEFAULT_LOBBY_ID } = useParams<{ lobbyId: string }>();
  return <LoisDesNormsLobby key={lobbyId} lobbyId={lobbyId} />;
};

export default LoisDesNorms;
