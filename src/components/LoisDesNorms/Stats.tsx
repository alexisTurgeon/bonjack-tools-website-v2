import { Box, Link, Typography } from "@mui/material";
import { useQueries } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import { AvailablePlayers, PlayerStats, statNote, winRate } from "../../helpers/loisDesNorms";
import Nameplate from "./Nameplate";
import { playerStatsQuery, statsOf } from "./playerStats";
import { caps, colors, fonts, visuallyHidden } from "./tokens";

const cellSx = { py: 0.75, px: 0.75, borderBottom: `1px solid ${colors.rule}` } as const;
const numberSx = { ...cellSx, textAlign: "right", fontFamily: fonts.mono, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;
const headSx = { ...caps, fontSize: "0.6875rem", letterSpacing: "0.12em", color: colors.muted, fontWeight: 700, borderBottom: `1px solid ${colors.goldDark}` } as const;

/** Ledger of the players in the voice channel: games won, total rolls, win rate. */
const Stats = (props: { availablePlayers: AvailablePlayers }) => {
  // Live stats per player; the lobby state's own (stale) stats are only placeholders.
  const players = Object.entries(props.availablePlayers).filter(([id, p]) => id !== "" && p && p.name);
  const results = useQueries({
    queries: players.map(([id, p]) => playerStatsQuery(id, p.stats)),
  });
  const rows = players
    .map(([id, p], i) => ({ id, name: p.name ?? "", stats: statsOf(results[i], p.stats) }))
    .filter((row): row is { id: string; name: string; stats: PlayerStats } => row.stats !== undefined);

  if (rows.length === 0) {
    return (
      <Typography sx={{ color: colors.muted, fontSize: "0.9375rem" }}>
        No stats yet for the players in voice. They count from the first finished loi.
      </Typography>
    );
  }

  const team = {
    numberOfGame: rows.reduce((acc, r) => acc + r.stats.numberOfGame, 0),
    totalRoll: rows.reduce((acc, r) => acc + r.stats.totalRoll, 0),
  };

  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "0.875rem" }}>
      <caption style={visuallyHidden}>Player stats: games won, total rolls and win rate</caption>
      <colgroup>
        <col />
        <col style={{ width: 44 }} />
        <col style={{ width: 48 }} />
        <col style={{ width: 64 }} />
      </colgroup>
      <thead>
        <tr>
          <Box component="th" scope="col" sx={{ ...cellSx, ...headSx, textAlign: "left" }}>Player</Box>
          <Box component="th" scope="col" sx={{ ...numberSx, ...headSx }} title="Games won">G</Box>
          <Box component="th" scope="col" sx={{ ...numberSx, ...headSx }} title="Total rolls">R</Box>
          <Box component="th" scope="col" sx={{ ...numberSx, ...headSx }} title="Win rate">WR</Box>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <Box component="th" scope="row" sx={{ ...cellSx, textAlign: "left", fontWeight: 400 }}>
              <Nameplate
                size="sm"
                initialFrom={row.name}
                name={
                  <Link component={RouterLink} to={`/profile?id=${encodeURIComponent(row.id)}`} sx={{ color: colors.cream }}>
                    {row.name}
                  </Link>
                }
                note={statNote(row.stats)}
              />
            </Box>
            <Box component="td" sx={numberSx}>{row.stats.numberOfGame}</Box>
            <Box component="td" sx={numberSx}>{row.stats.totalRoll}</Box>
            <Box component="td" sx={numberSx}>{winRate(row.stats).toFixed(1)}%</Box>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <Box component="th" scope="row" sx={{ ...cellSx, ...caps, textAlign: "left", borderBottom: "none", fontWeight: 700, color: colors.goldText }}>
            Team
          </Box>
          <Box component="td" sx={{ ...numberSx, borderBottom: "none", color: colors.goldText }}>{team.numberOfGame}</Box>
          <Box component="td" sx={{ ...numberSx, borderBottom: "none", color: colors.goldText }}>{team.totalRoll}</Box>
          <Box component="td" sx={{ ...numberSx, borderBottom: "none", color: colors.goldText }}>{winRate(team).toFixed(1)}%</Box>
        </tr>
      </tfoot>
    </Box>
  );
};

export default Stats;
