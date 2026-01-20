import { Box, Spacer, Text } from "ink";
import type { Agent } from "../types.js";
import { AgentStatusIndicator } from "./StatusIndicator.js";
import { LabeledShortcut } from "./LabeledShortcut.js";

interface AgentListProps {
  agents: Agent[];
  selectedIndex: number;
}

interface AgentRowProps {
  agent: Agent;
  index: number;
  selectedIndex: number;
}

export function AgentRow({ agent, index, selectedIndex }: AgentRowProps) {
  return <Box gap={1}>
    <Text>{index === selectedIndex ? "▶" : "  "}</Text>
    <Text inverse={index === selectedIndex}>{agent.name}</Text>
    <Spacer />
    <AgentStatusIndicator status={agent.status} />
    <Text dimColor>⌥{index + 1}</Text>
  </Box>
}

export function AgentList({ agents, selectedIndex }: AgentListProps) {
  return (
    <Box flexDirection="column" paddingX={1} flexGrow={1}>
      <Box marginTop={-1}>
        <Text>Agents</Text>
      </Box>
      <Box flexDirection="column" margin={1}>
        {agents.map((agent, index) => (
          <AgentRow key={agent.id} agent={agent} index={index} selectedIndex={selectedIndex} />
        ))}
      </Box>
      <Spacer />
      <Box flexDirection="row" marginBottom={-1}>
        <Text> </Text>
        <LabeledShortcut hotkey="⌥N"><Text>New Agent</Text></LabeledShortcut>
        <Text> | </Text>
        <Text dimColor>⌥+↑↓ to navigate</Text>
        <Text> | </Text>
        <LabeledShortcut hotkey="⌥+delete"><Text>Delete</Text></LabeledShortcut>
        <Text> </Text>
      </Box>
    </Box>
  );
}
