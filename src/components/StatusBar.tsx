import { Box, Spacer, Text } from "ink";
import { Hotkey } from "./Hotkey.js";
import { UsageBar } from "./UsageBar.js";
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
}

export function StatusBar({ agents = [] }: StatusBarProps) {
  return (
    <Box paddingX={2}>
      <Text><Text color="magentaBright">⏵⏵ accept edits on</Text> (shift+tab to cycle)</Text>
      <Spacer />
      <LabeledShortcut hotkey="⌥A">
        <Text color="blue">🤖 Refactor auth</Text>
      </LabeledShortcut>
      <Box width={3} />
      <AgentStatusSummary agents={agents} />
    </Box>
  );
}
