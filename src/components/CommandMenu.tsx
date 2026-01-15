import { Box, Spacer, Text } from "ink";
import type { Command } from "../types.js";

interface CommandMenuProps {
  commands: Command[];
  selectedIndex: number;
  filter: string;
}

export function CommandMenu({ commands, selectedIndex, filter }: CommandMenuProps) {
  // Show max 6 commands
  const visibleCommands = commands.slice(0, 6);

  return (
    <Box flexDirection="column" paddingX={2}>
      {visibleCommands.map((command, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={command.name} gap={2}>
            <Box width={24}>
              <Text color={isSelected ? "magenta" : undefined}>/{command.name}</Text>
              <Spacer />
              {command.shortcut && <Text dimColor>{command.shortcut}</Text>}
            </Box>
            <Text color={isSelected ? "magenta" : undefined}>{command.description}</Text>
          </Box>
        );
      })}
      {visibleCommands.length === 0 && (
        <Text dimColor>No commands match "/{filter}"</Text>
      )}
    </Box>
  );
}
