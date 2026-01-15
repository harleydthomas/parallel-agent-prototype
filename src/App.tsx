import { useState, useEffect } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { mockAgents } from "./data/mockAgents.js";
import { AgentOverview, CommandMenu, PromptInput, StatusBar, TerminalOutput } from "./components/index.js";
import { useMouseScroll } from "./hooks/useMouseScroll.js";
import type { Command } from "./types.js";

const commands: Command[] = [
  { name: "init", description: "Initialize a new CLAUDE.md file with codebase documentation" },
  { name: "add-dir", description: "Add a new working directory" },
  { name: "agents", description: "Manage running agents", shortcut: "⌥A" },
  { name: "agent-config", description: "Manage agent configurations" },
  { name: "chrome", description: "Claude in Chrome (Beta) settings" },
  { name: "clear", description: "Clear conversation history and free up context" },
  { name: "compact", description: "Clear conversation history but keep a summary in context" },
  { name: "mobile", description: "Show QR code to download the Claude mobile app" },
  { name: "permissions", description: "Manage allow & deny tool permission rules" },
  { name: "install-github-app", description: "Set up Claude GitHub Actions for a repository" },
  { name: "usage", description: "Show plan usage limits" },
  { name: "context", description: "Visualize current context usage as a colored grid" },
  { name: "doctor", description: "Diagnose and verify your Claude Code installation and settings" },
  { name: "stats", description: "Show your Claude Code usage statistics and activity" },
  { name: "ide", description: "Manage IDE integrations and show status" }
];

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
  const selectedAgent = mockAgents[selectedIndex];

  // Command menu state derived from input
  const showCommandMenu = inputValue.startsWith("/");
  const commandFilter = inputValue.slice(1);
  const filteredCommands = commands.filter(c => c.name.includes(commandFilter));

  // Calculate viewport height (terminal rows minus prompt and status bar)
  // Prompt = 3 lines (borders + content), StatusBar = 1 line, plus 1 for Ink's rendering
  const viewportHeight = (stdout.rows || 40) - 5;

  // Scroll state - computed synchronously to avoid flicker when switching agents
  const { scrollOffset, scrollUp, scrollDown } = useMouseScroll({
    contentLength: selectedAgent.outputLines.length,
    viewportHeight,
    agentId: selectedAgent.id,
  });

  // Reset command selection when filter changes
  useEffect(() => {
    setCommandSelectedIndex(0);
  }, [commandFilter]);

  useInput((input, key) => {
    if (input === "q") {
      exit();
    }

    // Command menu navigation and execution
    if (showCommandMenu) {
      if (key.upArrow) {
        setCommandSelectedIndex(i => Math.max(0, i - 1));
        return;
      }
      if (key.downArrow) {
        setCommandSelectedIndex(i => Math.min(Math.min(filteredCommands.length, 6) - 1, i + 1));
        return;
      }
      if (key.return && filteredCommands.length > 0) {
        const selectedCommand = filteredCommands[commandSelectedIndex];
        if (selectedCommand?.name === "agents") {
          setShowAgentOverview(true);
        }
        setInputValue("");
        return;
      }
    }

    // Arrow keys for scrolling (when not in agent overview or command menu)
    if (!showAgentOverview && !showCommandMenu) {
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

    if (key.escape) {
      if (showCommandMenu) {
        setInputValue("");
        return;
      }
      if (showAgentOverview) {
        setShowAgentOverview(false);
      }
    }

    // Tab navigation when agent overview is open
    if (showAgentOverview) {
      if (key.meta && key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (key.meta && key.downArrow) {
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
        ) : showCommandMenu ? (
          <CommandMenu
            commands={filteredCommands}
            selectedIndex={commandSelectedIndex}
            filter={commandFilter}
          />
        ) : (
          <StatusBar agents={mockAgents} />
        )}
      </Box>
    </Box>
  );
}
