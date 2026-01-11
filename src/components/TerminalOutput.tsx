import { Box } from "ink";
import type { Agent } from "../types.js";

interface TerminalOutputProps {
  agent: Agent;
}

export function TerminalOutput({ agent }: TerminalOutputProps) {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {agent.output}
    </Box>
  );
}
