import { Box } from "ink";
import type { Agent } from "../types.js";

interface TerminalOutputProps {
  agent: Agent;
  scrollOffset?: number;
}

export function TerminalOutput({ agent, scrollOffset = 0 }: TerminalOutputProps) {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      <Box flexDirection="column" marginTop={-scrollOffset}>
        {agent.output}
      </Box>
    </Box>
  );
}
