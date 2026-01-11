import { Box } from "ink";
import type { Agent } from "../types.js";
import { AgentList } from "./AgentList.js";
import { TaskQueue } from "./TaskQueue.js";

interface AgentOverviewProps {
  agents: Agent[];
  selectedIndex: number;
}

export function AgentOverview({ agents, selectedIndex }: AgentOverviewProps) {
  return (
    <Box flexDirection="row" flexGrow={1}>
      <Box
        flexDirection="column"
        borderStyle="single"
        width="40%"
      >
        <AgentList agents={agents} selectedIndex={selectedIndex} />
      </Box>
      <Box
        flexDirection="column"
        borderStyle="single"
        width="60%"
      >
        <TaskQueue agent={agents[selectedIndex]} />
      </Box>
    </Box>
  );
}
