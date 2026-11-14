import { useQuery } from "@tanstack/react-query";
import { getPlayerStats } from "../../api/players";
import { statNote } from "../../helpers/loisDesNorms";

/** Stats change at most once per finished loi; the 3 s list poll must not refetch them. */
const STATS_STALE_MS = 5 * 60_000;

/** A player's one-line stat note, shared with the profile page's ["player-stats", id] cache. */
export const usePlayerStatNote = (playerId: string | undefined): string | undefined => {
  const query = useQuery({
    queryKey: ["player-stats", playerId],
    queryFn: () => getPlayerStats(playerId ?? ""),
    enabled: Boolean(playerId),
    staleTime: STATS_STALE_MS,
    retry: false,
  });
  return statNote(query.data?.stats);
};
