import { Box, Spacer, Text } from "ink";
import { AgentStatusCount } from "./StatusIndicator.js";
import type { Agent } from "../types.js";
import { LabeledShortcut } from "./index.js";

function AgentStatusSummary({ agents }: { agents: Agent[] }) {
  const workingCount = agents.filter(a => a.status === "working").length;
  const waitingCount = agents.filter(a => a.status === "needs_input").length;
  const doneCount = agents.filter(a => a.status === "done").length;

  return (
    <Box gap={3}>
      <AgentStatusCount status="needs_input" count={waitingCount} />
      <AgentStatusCount status="working" count={workingCount} />
      <AgentStatusCount status="done" count={doneCount} />
    </Box>
  );
}

interface StatusBarProps {
  agents?: Agent[];
  selectedAgent: Agent;
}

export function StatusBar({ agents = [], selectedAgent }: StatusBarProps) {
  return (
    <Box paddingX={2}>
      <Box>
        {selectedAgent.status === "needs_input" ? (
          <Text>Esc to cancel · Tab to add additional instructions</Text>
        ) : (
          <Text><Text color="magentaBright">⏵⏵ accept edits on</Text> (shift+tab to cycle)</Text>
        )}
      </Box>
      <Spacer />
      <LabeledShortcut hotkey="⌥A">
        <Text>🤖 <Text color="blue">{selectedAgent.name}</Text></Text>
      </LabeledShortcut>
      <Box width={3} />
      <AgentStatusSummary agents={agents} />
    </Box>
  );
}
