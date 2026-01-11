import { Box, Spacer, Text } from "ink";
import type { Agent } from "../types.js";
import { Hotkey } from "./Hotkey.js";
import { AgentStatusIndicator } from "./StatusIndicator.js";

interface AgentListProps {
  agents: Agent[];
  selectedIndex: number;
}

export function AgentList({ agents, selectedIndex }: AgentListProps) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginTop={-1}>
        <Hotkey word="Agents" hotkey="a" />
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {agents.map((agent, index) => (
          <Box key={agent.id} gap={1}>
            <Text>{index === selectedIndex ? "▶" : "  "}</Text>
            <Text inverse={index === selectedIndex}>{agent.name}</Text>
            <Spacer />
            <AgentStatusIndicator status={agent.status} />
          </Box>
        ))}
      </Box>
      <Spacer />
      <Box marginBottom={-1}>
        <Hotkey word="New Agent" hotkey="n" />
      </Box>
    </Box>
  );
}
