import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Text, useApp, useInput, useStdout, measureElement, type DOMElement } from "ink";
import { mockAgents as initialMockAgents } from "./data/mockAgents.js";
import { AgentOverview, CommandMenu, PromptInput, StatusBar, TerminalOutput, Working, Prompt } from "./components/index.js";
import { useMouseScroll } from "./hooks/useMouseScroll.js";
import { statusPriority, type Agent } from "./types.js";
import { commands } from "./components/CommandMenu.js";

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [agents, setAgents] = useState<Agent[]>(initialMockAgents);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAgentOverview, setShowAgentOverview] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const selectedAgent = agents[selectedIndex];
  const optionIds = selectedAgent.optionIds ?? [];
  const hasOptions = optionIds.length > 0;
  const bottomRef = useRef<DOMElement>(null);
  const [bottomHeight, setBottomHeight] = useState(0);

  // Sorted agent indices for cycling: needs_input first, then done
  // Working agents are excluded unless all agents are working
  const sortedAgentIndices = useMemo(() => {
    const hasNonWorkingAgents = agents.some(agent => agent.status !== "working");

    return agents
      .map((agent, index) => ({ agent, index }))
      .filter(item => !hasNonWorkingAgents || item.agent.status !== "working")
      .sort((a, b) => {
        const statusDiff = statusPriority[a.agent.status] - statusPriority[b.agent.status];
        if (statusDiff !== 0) return statusDiff;
        return a.agent.id.localeCompare(b.agent.id);
      })
      .map(item => item.index);
  }, [agents]);

  // Start working on an agent: change status to "working" and append Prompt + Working lines
  const startWorking = useCallback((prompt: string, workingMessage: string = "Thinking") => {
    const timestamp = Date.now();
    selectedAgent.tasks = []; // Clear tasks when starting work
    setAgents(prevAgents => prevAgents.map((agent, index) => {
      if (index !== selectedIndex) return agent;
      return {
        ...agent,
        status: "working" as const,
        optionIds: undefined,
        outputLines: [
          ...agent.outputLines,
          <Prompt key={`prompt-${timestamp}`}>{prompt}</Prompt>,
          <Text key={`space-${timestamp}`}> </Text>,
          <Working key={`working-${timestamp}`}>{workingMessage}</Working>,
          <Text key={`end-${timestamp}`}> </Text>,
        ],
      };
    }));
  }, [selectedIndex]);

  // Command menu state derived from input
  const showCommandMenu = inputValue.startsWith("/");
  const commandFilter = inputValue.slice(1).toLowerCase();
  const filteredCommands = commands.filter(c => {
    // Match if any word (separated by hyphen) starts with the filter
    const words = c.name.toLowerCase().split("-");
    return words.some(word => word.startsWith(commandFilter));
  });

  // Measure bottom section height and calculate viewport height dynamically
  useEffect(() => {
    if (bottomRef.current) {
      const { height } = measureElement(bottomRef.current);
      setBottomHeight(height);
    }
  }, [showAgentOverview, showCommandMenu, selectedAgent.status, filteredCommands.length]);

  const viewportHeight = (stdout.rows || 40) - bottomHeight;

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

  // Reset option selection and prompt input when agent changes
  useEffect(() => {
    const ids = agents[selectedIndex]?.optionIds ?? [];
    setSelectedOptionId(ids.length > 0 ? ids[0] : null);
    setInputValue("");
  }, [selectedIndex, agents]);

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

    // Option selection: arrow keys to navigate, number keys to select, Enter to confirm
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
      // Number keys 1-9 select corresponding option
      if (/^[1-9]$/.test(input)) {
        const optionIndex = parseInt(input, 10) - 1;
        if (optionIndex < optionIds.length) {
          const targetOptionId = optionIds[optionIndex];
          const selectedOption = selectedAgent.outputLines.find(
            (line): line is React.ReactElement =>
              React.isValidElement(line) &&
              (line.props as { id?: string }).id === targetOptionId
          );
          const optionLabel = selectedOption ? (selectedOption.props as { children?: string }).children || "Selected option" : "Selected option";
          startWorking(optionLabel);
          return;
        }
      }
      if (key.return && selectedOptionId) {
        // Find the selected option's label from outputLines
        const selectedOption = selectedAgent.outputLines.find(
          (line): line is React.ReactElement =>
            React.isValidElement(line) &&
            (line.props as { id?: string }).id === selectedOptionId
        );
        const optionLabel = selectedOption ? (selectedOption.props as { children?: string }).children || "Selected option" : "Selected option";
        startWorking(optionLabel);
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

    // Agent list navigation
    if (showAgentOverview) {
      if (key.meta && key.upArrow) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (key.meta && key.downArrow) {
        setSelectedIndex((i) => Math.min(agents.length - 1, i + 1));
      }

      // Number keys to quick select agent
      if (key.meta && /^[1-9]$/.test(input)) {
        const index = parseInt(input, 10) - 1;
        if (index < agents.length) {
          setSelectedIndex(index);
        }
      }

      // Option + N to create new agent
      if (key.meta && input === "n") {
        const newId = String(Date.now());
        const newAgent: Agent = {
          id: newId,
          name: "New agent",
          status: "done",
          tasks: [],
          outputLines: [],
        };
        setAgents(prev => [...prev, newAgent]);
        setSelectedIndex(agents.length);
        return;
      }

      // Option + R to remove selected agent
      if (key.meta && key.delete) {
        if (agents.length > 1) {
          setAgents(prev => prev.filter((_, i) => i !== selectedIndex));
          setSelectedIndex(i => Math.min(i, agents.length - 2));
        }
        return;
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
    if (inputValue.trim()) {
      startWorking(inputValue.trim());
    }
    setInputValue("");
  };

  const handleAutocomplete = () => {
    setInputValue(selectedAgent.suggestion || "");
  };

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <TerminalOutput
        agent={selectedAgent}
        scrollOffset={scrollOffset}
        viewportHeight={viewportHeight}
        selectedOptionId={selectedOptionId}
      />
      <Box ref={bottomRef} flexDirection="column">
        <PromptInput
          value={inputValue}
          onChangeChar={handleInputChar}
          onDeleteChar={handleDeleteChar}
          onClear={handleClearInput}
          onSubmit={handleInputSubmit}
          onTab={handleAutocomplete}
          isActive={selectedAgent.status !== "needs_input"}
          selectedAgent={selectedAgent}
        />
        {showCommandMenu ? (
          <CommandMenu
            commands={filteredCommands}
            selectedIndex={commandSelectedIndex}
            filter={commandFilter}
          />
        ) : (
          <>
            <StatusBar agents={agents} selectedAgent={selectedAgent} />
            {showAgentOverview && (
              <AgentOverview agents={agents} selectedIndex={selectedIndex} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
