import { useState, useRef } from "react";
import { Box, useApp, useInput } from "ink";
import { mockAgents } from "./data/mockAgents.js";
import { AgentOverview, PromptInput, StatusBar, TerminalOutput } from "./components/index.js";

export function App() {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const isHandlingHotkey = useRef(false);

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
    setInputValue(value);
  };

  const handleInputSubmit = (value: string) => {
    // For now, just clear the input on submit
    setInputValue("");
  };

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <TerminalOutput agent={mockAgents[selectedIndex]} />
      {showAgentOverview ? (
        <AgentOverview agents={mockAgents} selectedIndex={selectedIndex} />
      ) : (
        <PromptInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          isActive={true}
        />
      )}
      <StatusBar mode={showAgentOverview ? "agents" : "main"} />
    </Box>
  );
}
