import { useState, useEffect, useMemo } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import { mockAgents } from "./data/mockAgents.js";
import { AgentOverview, CommandMenu, PromptInput, StatusBar, TerminalOutput } from "./components/index.js";
import { useMouseScroll } from "./hooks/useMouseScroll.js";
import type { AgentStatus, Command } from "./types.js";

// Status priority for cycling: needs_input first, then done, then working
const statusPriority: Record<AgentStatus, number> = {
  needs_input: 0,
  done: 1,
  working: 2,
};

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
  { name: "ide", description: "Manage IDE integrations and show status" },
  { name: "exit", description: "Exit the REPL" }
];

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const selectedAgent = mockAgents[selectedIndex];
  const optionIds = selectedAgent.optionIds ?? [];
  const hasOptions = optionIds.length > 0;

  // Sorted agent indices for cycling: needs_input first, then done, then working
  const sortedAgentIndices = useMemo(() => {
    return mockAgents
      .map((agent, index) => ({ agent, index }))
      .sort((a, b) => {
        const statusDiff = statusPriority[a.agent.status] - statusPriority[b.agent.status];
        if (statusDiff !== 0) return statusDiff;
        return a.agent.id.localeCompare(b.agent.id);
      })
      .map(item => item.index);
  }, []);

  // Command menu state derived from input
  const showCommandMenu = inputValue.startsWith("/");
  const commandFilter = inputValue.slice(1).toLowerCase();
  const filteredCommands = commands.filter(c => {
    // Match if any word (separated by hyphen) starts with the filter
    const words = c.name.toLowerCase().split("-");
    return words.some(word => word.startsWith(commandFilter));
  });

  // Calculate viewport height (terminal rows minus prompt and status bar)
  // Prompt = 3 lines (borders + content), StatusBar = 1 line, plus 1 for Ink's rendering
  // AgentOverview = 5 lines (padding + border + margin) + number of agents
  const agentOverviewHeight = showAgentOverview ? 5 + mockAgents.length : 0;
  const viewportHeight = (stdout.rows || 40) - (selectedAgent.status === "needs_input" ? 2 : 5) - agentOverviewHeight;

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

  // Reset option selection when agent changes
  useEffect(() => {
    const ids = mockAgents[selectedIndex].optionIds ?? [];
    setSelectedOptionId(ids.length > 0 ? ids[0] : null);
  }, [selectedIndex]);

  useInput((input, key) => {
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

        if (selectedCommand?.name === "exit") {
          exit();
        }
        
        setInputValue("");
        return;
      }
    }

    // Arrow keys for option selection (works even with AgentOverview open)
    // Exclude meta+arrow which is used for agent navigation in AgentOverview
    if (!showCommandMenu && hasOptions && !key.meta) {
      const currentIndex = selectedOptionId ? optionIds.indexOf(selectedOptionId) : 0;
      if (key.upArrow) {
        const newIndex = Math.max(0, currentIndex - 1);
        setSelectedOptionId(optionIds[newIndex]);
        return;
      }
      if (key.downArrow) {
        const newIndex = Math.min(optionIds.length - 1, currentIndex + 1);
        setSelectedOptionId(optionIds[newIndex]);
        return;
      }
    }

    // Arrow keys for scrolling (when not in agent overview, command menu, and no options)
    if (!showAgentOverview && !showCommandMenu && !hasOptions) {
      if (key.upArrow) {
        scrollUp();
        return;
      }
      if (key.downArrow) {
        scrollDown();
        return;
      }
    }

    // Shift + Option + A to cycle through agents
    if (key.meta && input === "A" && !showCommandMenu) {
      const currentSortedPos = sortedAgentIndices.indexOf(selectedIndex);
      const nextSortedPos = (currentSortedPos + 1) % sortedAgentIndices.length;
      setSelectedIndex(sortedAgentIndices[nextSortedPos]);
      return;
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
        selectedOptionId={selectedOptionId}
      />
      <Box flexDirection="column">
        {selectedAgent.status !== "needs_input" && (
          <PromptInput
            value={inputValue}
            onChangeChar={handleInputChar}
            onDeleteChar={handleDeleteChar}
            onClear={handleClearInput}
            onSubmit={handleInputSubmit}
            isActive={true}
          />
        )}
        {showCommandMenu ? (
          <CommandMenu
            commands={filteredCommands}
            selectedIndex={commandSelectedIndex}
            filter={commandFilter}
          />
        ) : (
          <>
            <StatusBar agents={mockAgents} selectedAgent={selectedAgent} />
            {showAgentOverview && (
              <AgentOverview agents={mockAgents} selectedIndex={selectedIndex} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
