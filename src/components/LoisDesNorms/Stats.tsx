import { Box, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AvailablePlayers, statNote, winRate } from "../../helpers/loisDesNorms";
import Nameplate from "./Nameplate";
import { colors, fonts, line, visuallyHidden } from "./tokens";

const NUMBER_COLUMNS = ["Games", "Rolls", "Win rate"] as const;

const cellSx = { py: 1.25, px: { xs: 0.5, sm: 1.5 }, borderBottom: line(colors.inkRule) } as const;
const numberSx = { ...cellSx, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as const;

const WinRate = ({ value }: { value: number }) => (
  <Box sx={{ display: "grid", justifyItems: "end", gap: 0.5 }}>
    <span>{value.toFixed(1)} %</span>
    <Box aria-hidden sx={{ width: { xs: 44, sm: 64 }, height: 2, backgroundColor: colors.inkRule }}>
      <Box sx={{ width: `${Math.min(100, value)}%`, height: "100%", backgroundColor: colors.ink }} />
    </Box>
  </Box>
);

/** Scoresheet of the players in the voice channel: games, rolls and win rate. */
const Stats = (props: { availablePlayers: AvailablePlayers }) => {
  const rows = Object.entries(props.availablePlayers)
    .filter(([, p]) => p && p.name && p.stats)
    .map(([id, p]) => ({ id, name: p.name ?? "", stats: p.stats! }));

  if (rows.length === 0) {
    return (
      <Typography sx={{ color: colors.inkSoft }}>
        No stats yet for the players in the voice channel. They count from the first finished loi.
      </Typography>
    );
  }

  const team = {
    numberOfGame: rows.reduce((acc, r) => acc + r.stats.numberOfGame, 0),
    totalRoll: rows.reduce((acc, r) => acc + r.stats.totalRoll, 0),
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        component="table"
        sx={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "0.9375rem" }}
      >
        <caption style={visuallyHidden}>Player stats: games won, total rolls and win rate</caption>
        <colgroup>
          <col />
          {/* The figures share the panel's width with the names: no dead band at desktop width. */}
          <Box component="col" sx={{ width: { xs: 52, sm: "18%" } }} />
          <Box component="col" sx={{ width: { xs: 48, sm: "18%" } }} />
          <Box component="col" sx={{ width: { xs: 72, sm: "22%" } }} />
        </colgroup>
        <thead>
          <tr>
            <Box component="th" scope="col" sx={{ ...cellSx, textAlign: "left", color: colors.inkSoft, fontWeight: 600, fontSize: "0.8125rem", borderBottom: line() }}>
              Player
            </Box>
            {NUMBER_COLUMNS.map((label) => (
              <Box key={label} component="th" scope="col" sx={{ ...numberSx, color: colors.inkSoft, fontWeight: 600, fontSize: "0.8125rem", borderBottom: line() }}>
                {label}
              </Box>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <Box component="th" scope="row" sx={{ ...cellSx, textAlign: "left", fontWeight: 400 }}>
                <Nameplate
                  initialFrom={row.name}
                  name={
                    <Link component={RouterLink} to={`/profile?id=${encodeURIComponent(row.id)}`}>
                      {row.name}
                    </Link>
                  }
                  note={statNote(row.stats)}
                />
              </Box>
              <Box component="td" sx={numberSx}>{row.stats.numberOfGame}</Box>
              <Box component="td" sx={numberSx}>{row.stats.totalRoll}</Box>
              <Box component="td" sx={numberSx}>
                <WinRate value={winRate(row.stats)} />
              </Box>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <Box component="th" scope="row" sx={{ ...cellSx, textAlign: "left", borderBottom: "none", fontFamily: fonts.display, fontWeight: 700, fontSize: "1.0625rem" }}>
              Team
            </Box>
            <Box component="td" sx={{ ...numberSx, borderBottom: "none", fontWeight: 600 }}>{team.numberOfGame}</Box>
            <Box component="td" sx={{ ...numberSx, borderBottom: "none", fontWeight: 600 }}>{team.totalRoll}</Box>
            <Box component="td" sx={{ ...numberSx, borderBottom: "none", fontWeight: 600 }}>
              <WinRate value={winRate(team)} />
            </Box>
          </tr>
        </tfoot>
      </Box>
    </Box>
  );
};

export default Stats;
