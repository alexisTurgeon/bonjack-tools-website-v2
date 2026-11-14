import { Box, InputBase, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import { AvailablePlayers, Player, statNote } from "../../helpers/loisDesNorms";
import Nameplate from "./Nameplate";
import Token from "./Token";
import { fadeIn, REDUCED } from "./motion";
import { colors, focusRing, line, motion, radii, roleColors, sizes } from "./tokens";

export interface PlayerInfoProperties {
  index: number;
  seat: Player;
  availablePlayers: AvailablePlayers;
  leagueVersion: string;
  onChange: (event: SelectChangeEvent, index: number) => void;
  /** Changes on every roll seen live; 0 means no roll seen since the page opened. */
  flipKey: number;
  flipDelay: number;
  /** Changes when a player is seated here. */
  dropKey: number;
}

/** Text that appears with the token's flip rather than before it. */
const revealSx = (flipKey: number, delay: number) => ({
  animation: flipKey > 0 ? `${fadeIn} ${motion.routine}ms ease-out ${delay + motion.flip / 2}ms both` : "none",
  [REDUCED]: { animation: "none" },
});

/** One of the five seats: printed zone with the token, role, champion and the player picker. */
const PlayerInfo = (props: PlayerInfoProperties) => {
  const { index, seat, availablePlayers, onChange, flipKey, flipDelay, dropKey } = props;
  const { role, champion } = seat;
  const playerId = seat.player.id;
  const labelId = `seat-${index + 1}-label`;
  const rolled = playerId !== "" && role != null && champion != null;

  return (
    <Box
      sx={{
        border: line(),
        borderRadius: `${radii.panel}px`,
        p: 1.5,
        minWidth: 0,
        display: "grid",
        // Same height empty, seated or rolled: the mat never reflows on a roll.
        height: { xs: sizes.seatHeightCompact, sm: sizes.seatHeight },
        columnGap: 1.5,
        gridTemplateColumns: { xs: `${sizes.tokenCompact}px minmax(0, 1fr)`, sm: "minmax(0, 1fr)" },
        gridTemplateRows: { xs: "auto auto 1fr", sm: "26px 1fr 26px auto" },
        gridTemplateAreas: {
          xs: '"token label" "token champ" "token pick"',
          sm: '"label" "token" "champ" "pick"',
        },
        alignItems: "center",
      }}
    >
      <Box sx={{ gridArea: "label", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, minHeight: 22 }}>
        <Typography id={labelId} component="span" sx={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: colors.inkSoft }}>
          Seat {index + 1}
        </Typography>
        {rolled && (
          <Box
            key={flipKey}
            component="span"
            sx={{
              border: line(roleColors[role]),
              color: roleColors[role],
              borderRadius: `${radii.badge}px`,
              px: 0.75,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              lineHeight: "18px",
              ...revealSx(flipKey, flipDelay),
            }}
          >
            {role}
          </Box>
        )}
      </Box>

      <Box sx={{ gridArea: "token", display: "grid", placeItems: "center" }}>
        <Token
          seated={playerId !== ""}
          role={role}
          champion={champion}
          leagueVersion={props.leagueVersion}
          flipKey={flipKey}
          flipDelay={flipDelay}
          dropKey={dropKey}
        />
      </Box>

      <Typography
        key={flipKey}
        noWrap
        sx={{
          gridArea: "champ",
          textAlign: { xs: "left", sm: "center" },
          fontWeight: 600,
          fontSize: { xs: "0.9375rem", sm: "1.0625rem" },
          color: colors.ink,
          ...(rolled ? revealSx(flipKey, flipDelay) : {}),
        }}
      >
        {rolled ? champion.name : "\u00a0"}
      </Typography>

      <Box sx={{ gridArea: "pick", minWidth: 0, borderTop: { sm: line(colors.inkRule) }, pt: { sm: 1 }, mx: { sm: -0.5 } }}>
        <Select
          labelId={labelId}
          id={`seat-${index + 1}-select`}
          value={playerId}
          onChange={(evt) => onChange(evt, index)}
          displayEmpty
          fullWidth
          input={<InputBase />}
          IconComponent={KeyboardArrowDownRounded}
          // Plain nameplate in the closed select, even while a just-moved player
          // still carries the "in <other lobby>" marker.
          renderValue={(id) => {
            if (id === "") return <Nameplate empty name="Open seat" reserveNote />;
            const player = availablePlayers[id];
            const name = player?.name ?? seat.player.name ?? "—";
            return <Nameplate name={name} note={statNote(player?.stats)} reserveNote />;
          }}
          MenuProps={{ slotProps: { paper: { sx: { maxWidth: 360 } } } }}
          sx={{
            "& .MuiSelect-select": {
              borderRadius: `${radii.control}px`,
              py: 0.75,
              pl: 0.75,
              pr: "28px !important",
              transition: `background-color ${motion.quick}ms`,
            },
            "& .MuiSelect-select:hover": { backgroundColor: colors.inkWash },
            "& .MuiSelect-select:focus": { backgroundColor: "transparent", borderRadius: `${radii.control}px` },
            "& .MuiSelect-select:focus-visible": { ...focusRing, outlineOffset: 1 },
            "& .MuiSelect-icon": { color: colors.inkSoft, right: 2 },
          }}
        >
          <MenuItem value="">
            <Nameplate empty name="Empty seat" />
          </MenuItem>
          {Object.entries(availablePlayers)
            .filter(([id]) => id !== "")
            .map(([id, player]) => {
              const name = player.name ?? "—";
              const elsewhere = player.seatedIn;
              const stats = statNote(player.stats);
              if (!elsewhere) {
                return (
                  <MenuItem key={id} value={id}>
                    <Nameplate name={name} note={stats} />
                  </MenuItem>
                );
              }
              // Seated in another lobby: a game there locks them, otherwise picking moves them.
              const hint = elsewhere.gameInProgress ? "Playing there" : "Picking them moves them here";
              return (
                <MenuItem key={id} value={id} disabled={elsewhere.gameInProgress} sx={{ whiteSpace: "normal" }}>
                  <Nameplate
                    name={`${name} — in ${elsewhere.name}`}
                    initialFrom={name}
                    note={stats ? `${hint} · ${stats}` : hint}
                  />
                </MenuItem>
              );
            })}
        </Select>
      </Box>
    </Box>
  );
};

export default PlayerInfo;
