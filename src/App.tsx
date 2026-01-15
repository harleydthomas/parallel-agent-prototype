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
  const { scrollOffset, scrollUp, scrollDown, setContentLength } = useMouseScroll();
  const selectedAgent = mockAgents[selectedIndex];

  // Calculate viewport height (terminal rows minus prompt and status bar)
  // Prompt = 3 lines (borders + content), StatusBar = 1 line, plus 1 for Ink's rendering
  const viewportHeight = (stdout.rows || 40) - 5;

  // Update content length and scroll to bottom when agent changes
  useEffect(() => {
    setContentLength(selectedAgent.outputLines.length, viewportHeight, true);
  }, [selectedAgent.id, viewportHeight, setContentLength]);

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

    // Option + A to toggle agent overview
    if (key.meta && input === "a") {
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
      if (key.meta && /^[1-9]$/.test(input)) {
        const index = parseInt(input, 10) - 1;
        if (index < mockAgents.length) {
          setSelectedIndex(index);
        }
      }
    }
  });

  const handleInputChar = (char: string) => {
    setInputValue(prev => prev + char);
  };

  const handleDeleteChar = () => {
    setInputValue(prev => prev.slice(0, -1));
  };

  const handleClearInput = () => {
    setInputValue("");
  };

  const handleInputSubmit = () => {
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
          onChangeChar={handleInputChar}
          onDeleteChar={handleDeleteChar}
          onClear={handleClearInput}
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
