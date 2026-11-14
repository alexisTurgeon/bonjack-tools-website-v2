import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Skeleton, Typography } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { deleteLobby, listLobbies, LobbySummary } from "../api/loisDesNorms";
import { LOBBIES_QUERY_KEY } from "../helpers/loisDesNorms";
import { apiErrorMessage } from "../helpers/swiss";
import ConfirmDialog from "../components/Swiss/ConfirmDialog";
import FeltScene from "../components/LoisDesNorms/FeltScene";
import LobbyCard from "../components/LoisDesNorms/LobbyCard";
import NewLobbyDialog from "../components/LoisDesNorms/NewLobbyDialog";
import { colors, dashedLine, line, radii } from "../components/LoisDesNorms/tokens";
import { PLAYER_STATS_KEY } from "../components/LoisDesNorms/playerStats";

const POLL_INTERVAL_MS = 3000;

/** The contract gives no body for these DELETE errors; prefer the server's message when there is one. */
const closeErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: string }>(error) && !error.response?.data?.error) {
    if (error.response?.status === 404) return "That lobby was already closed.";
    if (error.response?.status === 409) return "That lobby can't be closed while a game is in progress.";
  }
  return apiErrorMessage(error);
};

const canClose = (lobby: LobbySummary) => !lobby.isDefault && !lobby.gameInProgress;

const gridSx = {
  display: "grid",
  // Wide enough for three chairs a side with whole stat notes.
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 520px), 1fr))",
  columnGap: { xs: 2, md: 4 },
  rowGap: { xs: 4, md: 5 },
} as const;

const CHAIRS = [0, 1, 2];

/** Placeholder table with the same shape as a real one. */
const TileSkeleton = () => (
  <Box sx={{ display: "grid", gap: 1.5 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, px: 1.5 }}>
      {CHAIRS.map((i) => (
        <Skeleton key={i} variant="rounded" height={26} />
      ))}
    </Box>
    <Box sx={{ border: line(colors.inkRule), borderRadius: `${radii.panel + 2}px`, height: 112 }} />
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, px: 1.5 }}>
      {CHAIRS.slice(1).map((i) => (
        <Skeleton key={i} variant="rounded" height={26} />
      ))}
    </Box>
  </Box>
);

/** Lobby list at /lois-des-norms. */
const LoisDesNormsLobbies = () => {
  const [creating, setCreating] = useState(false);
  // Kept after the confirm closes so its text doesn't blank during the fade-out.
  const [closeCandidate, setCloseCandidate] = useState<LobbySummary | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: LOBBIES_QUERY_KEY,
    queryFn: listLobbies,
    refetchInterval: POLL_INTERVAL_MS,
  });
  const remove = useMutation({
    mutationFn: deleteLobby,
    // A 404 or 409 also means the list is stale.
    onSettled: () => queryClient.invalidateQueries({ queryKey: LOBBIES_QUERY_KEY }),
  });
  const count = query.data?.length;

  // When a polled table's game ends, its players' stats have changed: refetch them.
  const wasInGame = useRef(new Map<string, boolean>());
  useEffect(() => {
    if (!query.data) return;
    const before = wasInGame.current;
    const ended = query.data.some((lobby) => before.get(lobby.id) === true && !lobby.gameInProgress);
    wasInGame.current = new Map(query.data.map((lobby) => [lobby.id, lobby.gameInProgress]));
    if (ended) void queryClient.invalidateQueries({ queryKey: PLAYER_STATS_KEY });
  }, [query.data, queryClient]);

  return (
    <FeltScene>
      <Box
        component="header"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "2.125rem", md: "2.75rem" } }}>
            Lois des Norms
          </Typography>
          <Typography sx={{ color: colors.inkSoft, mt: 1 }}>
            {count === undefined
              ? "Tables tonight"
              : `${count} table${count === 1 ? "" : "s"} tonight`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddRounded />}
          onClick={() => setCreating(true)}
        >
          New lobby
        </Button>
      </Box>

      <Box sx={{ display: "grid", gap: 2, mb: query.isError || remove.isError ? 3 : 0 }}>
        {query.isError && (
          <Alert severity="error">Could not load the tables: {apiErrorMessage(query.error)}</Alert>
        )}
        {remove.isError && (
          <Alert severity="error" onClose={() => remove.reset()}>
            {closeErrorMessage(remove.error)}
          </Alert>
        )}
      </Box>

      {query.isPending && (
        <Box sx={gridSx} aria-busy="true" aria-label="Loading tables">
          <TileSkeleton />
          <TileSkeleton />
          <TileSkeleton />
        </Box>
      )}
      {query.data && query.data.length === 0 && (
        <Box
          sx={{
            border: dashedLine(),
            borderRadius: `${radii.panel}px`,
            p: { xs: 3, md: 5 },
            textAlign: "center",
          }}
        >
          <Typography variant="h2" component="p">
            No table is open
          </Typography>
          <Typography sx={{ color: colors.inkSoft, mt: 1 }}>
            Start one with New lobby, then seat the group.
          </Typography>
        </Box>
      )}
      {query.data && query.data.length > 0 && (
        <Box sx={gridSx}>
          {query.data.map((lobby) => (
            <LobbyCard
              key={lobby.id}
              lobby={lobby}
              onClose={
                canClose(lobby)
                  ? () => {
                      setCloseCandidate(lobby);
                      setConfirmOpen(true);
                    }
                  : undefined
              }
              closing={remove.isPending && remove.variables === lobby.id}
            />
          ))}
        </Box>
      )}

      <NewLobbyDialog open={creating} onClose={() => setCreating(false)} />
      <ConfirmDialog
        open={confirmOpen}
        title="Close this lobby?"
        body={`"${closeCandidate?.name ?? ""}" will be removed and its seats freed. Anyone viewing it is told it was closed.`}
        confirmLabel="Close lobby"
        destructive
        onConfirm={() => {
          if (closeCandidate) remove.mutate(closeCandidate.id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </FeltScene>
  );
};

export default LoisDesNormsLobbies;
