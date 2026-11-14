import { Box } from "@mui/material";
import topThumb from "../../img/Position_TOP.png";
import adcThumb from "../../img/Position_ADC.png";
import supportThumb from "../../img/Position_SUPPORT.png";
import midThumb from "../../img/Position_MID.png";
import jungleThumb from "../../img/Position_JUNGLE.png";
import { Champion, LeagueOfLegendsRole } from "../../helpers/loisDesNorms";
import { dropIn, flipIn, highlightAnimation, REDUCED } from "./motion";
import { colors, dashedLine, fonts, line, motion, restingShadow, roleColors, sizes } from "./tokens";

const ROLE_IMAGES: Record<LeagueOfLegendsRole, string> = {
  TOP: topThumb,
  ADC: adcThumb,
  SUPPORT: supportThumb,
  MID: midThumb,
  JUNGLE: jungleThumb,
};

interface Props {
  /** A player sits here. */
  seated: boolean;
  role?: LeagueOfLegendsRole | null;
  champion?: Champion | null;
  leagueVersion: string;
  /** Changes on every roll seen live; 0 means no roll seen since the page opened. */
  flipKey: number;
  /** Delay before this seat flips, so the seats turn one after another. */
  flipDelay: number;
  /** Changes when a player is seated here; 0 means nothing happened yet. */
  dropKey: number;
}

const tokenSize = { xs: sizes.tokenCompact, sm: sizes.token };
const badgeSize = { xs: 26, sm: 34 };

const faceSx = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
} as const;

/** Cardboard back of a token: what a seated player shows before the roll. */
const TokenBack = () => (
  <Box
    sx={{
      ...faceSx,
      transform: "rotateY(180deg)",
      backgroundColor: colors.card,
      color: colors.cardInk,
      display: "grid",
      placeItems: "center",
      "&::after": {
        content: '""',
        position: "absolute",
        inset: { xs: 6, sm: 9 },
        borderRadius: "50%",
        border: line("rgba(23, 63, 47, 0.35)"),
      },
    }}
  >
    <Box
      component="span"
      sx={{
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize: { xs: "1.0625rem", sm: "1.625rem" },
        letterSpacing: "-0.03em",
      }}
    >
      LdN
    </Box>
  </Box>
);

const ChampionFace = ({
  role,
  champion,
  leagueVersion,
}: {
  role: LeagueOfLegendsRole;
  champion: Champion;
  leagueVersion: string;
}) => (
  <Box sx={faceSx}>
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        overflow: "hidden",
        border: { xs: `4px solid ${roleColors[role]}`, sm: `5px solid ${roleColors[role]}` },
        backgroundColor: colors.feltDeep,
      }}
    >
      <Box
        component="img"
        src={`https://ddragon.leagueoflegends.com/cdn/${leagueVersion}/img/champion/${champion.img}`}
        alt=""
        draggable={false}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          // Data Dragon squares carry a dark frame; crop it off.
          transform: "scale(1.12)",
        }}
      />
    </Box>
    <Box
      sx={{
        position: "absolute",
        right: { xs: -4, sm: -2 },
        bottom: { xs: -4, sm: -2 },
        width: badgeSize,
        height: badgeSize,
        borderRadius: "50%",
        backgroundColor: colors.feltDeep,
        border: line(roleColors[role]),
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box component="img" src={ROLE_IMAGES[role]} alt="" sx={{ width: "72%", height: "72%" }} />
    </Box>
  </Box>
);

/** A seat's round token: printed spot when open, cardboard back when seated, champion after a roll. */
const Token = ({ seated, role, champion, leagueVersion, flipKey, flipDelay, dropKey }: Props) => {
  const rolled = seated && role != null && champion != null;

  if (!seated) {
    return (
      <Box
        aria-hidden
        sx={{ width: tokenSize, height: tokenSize, flex: "none", borderRadius: "50%", border: dashedLine() }}
      />
    );
  }

  return (
    <Box
      key={`drop-${dropKey}`}
      aria-hidden
      sx={{
        width: tokenSize,
        height: tokenSize,
        flex: "none",
        position: "relative",
        perspective: "700px",
        borderRadius: "50%",
        boxShadow: restingShadow,
        animation: dropKey > 0 ? `${dropIn} ${motion.drop}ms ${motion.easeOut} both` : "none",
        [REDUCED]: { animation: dropKey > 0 ? highlightAnimation : "none" },
      }}
    >
      <Box
        key={`flip-${flipKey}`}
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          transformStyle: "preserve-3d",
          // Seated but not rolled: the back is the face up.
          transform: rolled ? "none" : "rotateY(180deg)",
          animation:
            rolled && flipKey > 0
              ? `${flipIn} ${motion.flip}ms ${motion.easeOut} ${flipDelay}ms both`
              : "none",
          [REDUCED]: { animation: rolled && flipKey > 0 ? highlightAnimation : "none" },
        }}
      >
        {rolled && <ChampionFace role={role} champion={champion} leagueVersion={leagueVersion} />}
        <TokenBack />
      </Box>
    </Box>
  );
};

export default Token;
