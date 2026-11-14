import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import Rules from "./Rules";
import Stats from "./Stats";
import { AvailablePlayers } from "../../helpers/loisDesNorms";
import { colors } from "./tokens";

/** Right column: the house rules, or the stats ledger. */
const AdditionalInformationBlock = (props: { availablePlayers: AvailablePlayers }) => {
  const [tab, setTab] = useState(0);

  return (
    <Box component="section" aria-label="Rules and stats">
      <Tabs
        value={tab}
        onChange={(_, value: number) => setTab(value)}
        sx={{ mb: 1.5, borderBottom: `1px solid ${colors.rule}`, "& .MuiTabs-flexContainer": { justifyContent: "flex-end" } }}
      >
        <Tab id="rules" label="Rules" value={0} aria-controls="rules-panel" />
        <Tab id="stats" label="Stats" value={1} aria-controls="stats-panel" />
      </Tabs>
      <div id="rules-panel" role="tabpanel" aria-labelledby="rules" hidden={tab !== 0}>
        <Rules />
      </div>
      <div id="stats-panel" role="tabpanel" aria-labelledby="stats" hidden={tab !== 1}>
        <Stats availablePlayers={props.availablePlayers} />
      </div>
    </Box>
  );
};

export default AdditionalInformationBlock;
