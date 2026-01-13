import { useState, useRef, useEffect } from "react";
import { Box, useApp, useInput } from "ink";
import { mockAgents } from "./data/mockAgents.js";
import { AgentOverview, PromptInput, StatusBar, TerminalOutput } from "./components/index.js";
import { useMouseScroll } from "./hooks/useMouseScroll.js";

export function App() {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isHandlingHotkey = useRef(false);
  const { scrollOffset, resetScroll } = useMouseScroll();

  // Reset scroll when agent changes
  useEffect(() => {
    resetScroll();
  }, [selectedIndex, resetScroll]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
    }

    // Ctrl + A to toggle agent overview
    if (key.ctrl && input === "a") {
      isHandlingHotkey.current = true;
      setShowAgentOverview((prev) => !prev);
      setTimeout(() => { isHandlingHotkey.current = false; }, 0);
      return;
    }

    if (key.escape && showAgentOverview) {
      setShowAgentOverview(false);
    }

    // Arrow navigation only when agent overview is open
    if (showAgentOverview) {
      if (key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
      if (key.downArrow) {
        setSelectedIndex((i) => Math.min(mockAgents.length - 1, i + 1));
      }
    }
  });

  const handleInputChange = (value: string) => {
    if (isHandlingHotkey.current) return;
    // Filter out mouse escape sequences (SGR format)
    // Matches both with ESC prefix (\x1b) and without (when ESC is handled separately)
    const filtered = value.replace(/(\x1b)?\[<\d+;\d+;\d+[Mm]/g, "");
    setInputValue(filtered);
  };

  const handleInputSubmit = (value: string) => {
    // For now, just clear the input on submit
    setInputValue("");
  };

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <TerminalOutput agent={mockAgents[selectedIndex]} scrollOffset={scrollOffset} />
      <Box flexDirection="column">
        { showAgentOverview ? (
          <AgentOverview agents={mockAgents} selectedIndex={selectedIndex} />
        ) : (
          <PromptInput
            value={inputValue}
            onChange={handleInputChange}
            onSubmit={handleInputSubmit}
            isActive={true}
          />
        )}
        <StatusBar mode={showAgentOverview ? "agents" : "main"} agents={mockAgents} />
      </Box>
    </Box>
  );
}
