import { Box } from "ink";
import type { Agent } from "../types.js";

interface TerminalOutputProps {
  agent: Agent;
  scrollOffset: number;
  viewportHeight: number;
}

export function TerminalOutput({ agent, scrollOffset, viewportHeight }: TerminalOutputProps) {
  // Slice the outputLines array to show only the visible portion
  const visibleLines = agent.outputLines.slice(scrollOffset, scrollOffset + viewportHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      {visibleLines}
    </Box>
  );
}
