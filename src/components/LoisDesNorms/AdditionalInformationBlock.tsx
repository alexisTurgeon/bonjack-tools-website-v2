import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import Rules from "./Rules";
import Stats from "./Stats";
import { AvailablePlayers } from "../../helpers/loisDesNorms";
import { colors, line, radii } from "./tokens";

/** Rules screen and scoresheet under the mat. */
const AdditionalInformationBlock = (props: { availablePlayers: AvailablePlayers }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box component="section" aria-label="Rules and stats">
      <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ minHeight: 44, mb: 1 }}>
        <Tab id="rules" label="Rules" value={0} aria-controls="rules-panel" />
        <Tab id="stats" label="Stats" value={1} aria-controls="stats-panel" />
      </Tabs>
      <Box
        sx={{
          border: line(),
          borderRadius: `${radii.panel}px`,
          backgroundColor: colors.feltDeep,
          p: { xs: 2, md: 3 },
          pb: { xs: 0.5, md: 1 },
        }}
      >
        <div id="rules-panel" role="tabpanel" aria-labelledby="rules" hidden={tab !== 0}>
          <Rules />
        </div>
        <Box id="stats-panel" role="tabpanel" aria-labelledby="stats" hidden={tab !== 1} sx={{ pb: { xs: 1.5, md: 2 } }}>
          <Stats availablePlayers={props.availablePlayers} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdditionalInformationBlock;
