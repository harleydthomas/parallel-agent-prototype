import { Box, Spacer, Text } from "ink";
import { Hotkey } from "./Hotkey.js";

interface StatusBarProps {
  mode: "main" | "agents";
}

export function StatusBar({ mode }: StatusBarProps) {
  if (mode === "agents") {
    return (
      <Box paddingX={1} gap={2}>
        <Spacer />
        <Text dimColor>↑↓ Navigate</Text>
        <Hotkey word="Close" hotkey="c" />
        <Text dimColor>(^A)</Text>
        <Hotkey word="Quit" hotkey="q" />
      </Box>
    );
  }

  return (
    <Box paddingX={1} gap={2}>
      <Spacer />
      <Hotkey word="Usage" hotkey="u" />
      <Text>
        <Text color="#87c893">■</Text>
        <Text color="#97c689">■</Text>
        <Text color="#a9c47e">■</Text>
        <Text color="#b9c276">■</Text>
        <Text color="#cea966">■</Text>
        <Text color="#d19260">■</Text>
        <Text color="#d57b59">■</Text>
        <Text color="#d86453">■</Text>
        <Text color="#404040">■</Text>
        <Text color="#404040">■</Text>
        <Text color="#404040">■</Text>
      </Text>
      <Text>79%</Text>
      <Box width={2} />
      <Hotkey word="Quit" hotkey="q" />
      <Hotkey word="/Commands" hotkey="/" />
    </Box>
  );
}
