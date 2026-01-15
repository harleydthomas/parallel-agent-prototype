import { useState, useEffect } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { mockAgents } from "./data/mockAgents.js";
import { AgentOverview, PromptInput, StatusBar, TerminalOutput } from "./components/index.js";
import { useMouseScroll } from "./hooks/useMouseScroll.js";

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { scrollOffset, scrollUp, scrollDown, setContentLength, resetScroll } = useMouseScroll();
  const selectedAgent = mockAgents[selectedIndex];

  // Calculate viewport height (terminal rows minus prompt and status bar)
  const viewportHeight = (stdout.rows || 40) - 4;

  // Update content length when agent changes or viewport resizes
  useEffect(() => {
    setContentLength(selectedAgent.outputLines.length, viewportHeight);
  }, [selectedAgent.id, selectedAgent.outputLines.length, viewportHeight, setContentLength]);

  // Reset scroll when agent changes
  useEffect(() => {
    resetScroll();
  }, [selectedIndex, resetScroll]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
    }

    // Arrow keys for scrolling (when not in agent overview)
    if (!showAgentOverview) {
      if (key.upArrow) {
        scrollUp();
        return;
      }
      if (key.downArrow) {
        scrollDown();
        return;
      }
    }

    // Ctrl + A to toggle agent overview
    if (key.ctrl && input === "a") {
      setShowAgentOverview((prev) => !prev);
      return;
    }

    if (key.escape && showAgentOverview) {
      setShowAgentOverview(false);
    }

    // Tab navigation when agent overview is open
    if (showAgentOverview) {
      if (key.shift && key.tab) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (key.tab) {
        setSelectedIndex((i) => Math.min(mockAgents.length - 1, i + 1));
      }

      // Number keys to quick select agent
      if (/^[1-9]$/.test(input)) {
        const index = parseInt(input, 10) - 1;
        if (index < mockAgents.length) {
          setSelectedIndex(index);
        }
      }
    }
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleInputSubmit = (value: string) => {
    setInputValue("");
  };

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <TerminalOutput
        agent={selectedAgent}
        scrollOffset={scrollOffset}
        viewportHeight={viewportHeight}
      />
      <Box flexDirection="column">
        <PromptInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleInputSubmit}
          isActive={true}
        />
        {showAgentOverview ? (
          <AgentOverview agents={mockAgents} selectedIndex={selectedIndex} />
        ) : (
          <StatusBar agents={mockAgents} />
        )}
      </Box>
    </Box>
  );
}
