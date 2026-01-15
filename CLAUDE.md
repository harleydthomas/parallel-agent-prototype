# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A design prototype exploring multi-agent orchestration UI for Claude Code. The goal is to visualize and manage multiple Claude Code agents running in parallel within a single interactive terminal instance. This is a portfolio project for a Product Design role.

## Commands

```bash
bun install          # Install dependencies
bun run src/index.tsx # Run the application
```

## Keyboard Shortcuts

### Main View
- **↑/↓** - Scroll terminal output
- **/** - Open command menu
- **Option+A** - Toggle AgentOverview panel
- **Ctrl+U** - Clear input
- **q** - Quit
- **Enter** - Submit prompt

### Command Menu
- **↑/↓** - Navigate commands
- **Enter** - Execute selected command
- **Escape** - Close menu
- Continue typing to filter commands

### AgentOverview
- **Option+A** - Close AgentOverview
- **Escape** - Close AgentOverview
- **Option+↑/↓** - Select previous/next agent
- **Option+1-9** - Quick select agent by index
- **q** - Quit

## Architecture

Terminal UI built with Ink (React for CLIs). Main view shows terminal output with prompt input; Option+A toggles the AgentOverview panel.

```
src/
├── index.tsx              # Entry point with alternate screen buffer
├── App.tsx                # Main app with state & input handling
├── types.ts               # Type definitions
├── data/
│   └── mockAgents.tsx     # Mock agent data with JSX output
├── hooks/
│   └── useMouseScroll.ts  # Mouse scroll handling for terminal output
└── components/
    ├── index.ts           # Barrel export
    ├── Code.tsx           # Syntax highlighting for code blocks
    ├── CommandMenu.tsx    # Slash command menu overlay
    ├── Hotkey.tsx         # Hotkey label with highlighted key
    ├── LabeledShortcut.tsx # Content with dimmed shortcut suffix
    ├── StatusIndicator.tsx # Agent, Task & AgentStatusCount indicators
    ├── StatusBar.tsx      # Bottom bar with context-specific content
    ├── UsageBar.tsx       # Usage meter component
    ├── PromptInput.tsx    # Text input with prompt prefix
    ├── AgentOverview.tsx  # Two-column agent/task panel
    ├── AgentList.tsx      # Agent list with status
    ├── TaskQueue.tsx      # Plan/task list for selected agent
    └── TerminalOutput.tsx # Terminal output display
```

## UI Patterns

- **Pane labels** use `marginTop={-1}` to sit inline with top border (fieldset-legend style)
- **Bottom hotkeys** use `marginBottom={-1}` with `<Spacer />` to align with bottom border
- **Hotkey component** highlights a single letter in red to indicate the keyboard shortcut
- **LabeledShortcut component** displays content with a dimmed shortcut suffix, e.g., `🤖 Refactor auth (^A)`
- **Focused pane** indicated by cyan border color

## Data Model

```typescript
type AgentStatus = "working" | "needs_input" | "done";
type TaskStatus = "completed" | "in_progress" | "pending";

interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  tasks: Task[];
  outputLines: ReactNode[];  // Array of lines for virtual scrolling
}

interface Command {
  name: string;
  description: string;
  shortcut?: string;
}
```

## Status Indicators

Agent status:
- Working ● (yellow)
- Waiting ● (red)
- Done ● (green)

Task status:
- ✓ completed (green)
- ● in progress (yellow)
- ○ pending (gray)

## Code Syntax Highlighting

The `Code` component uses regex-based tokenization for syntax highlighting with diff support:

**Diff lines:**
- Addition (`+`): line number and `+` in greenBright, code syntax highlighted
- Deletion (`-`): line number and `-` in redBright, code in gray

**Token colors:**
| Token | Color | Examples |
|-------|-------|----------|
| keyword | magentaBright | `export`, `function`, `return`, `const` |
| string | red | `"text"`, `'text'` |
| literal | cyan | `true`, `false`, `null`, numbers |
| element | yellow | `<Box>`, `<Text>` |
| property | blue | `flexDirection=`, `color=` |
| typeName | yellow | `AgentListProps`, `ReactNode` |
| param | cyan | `agents`, `selectedIndex` |
| comment | dim | `// comment` |

## Virtual List Scrolling

The `useMouseScroll` hook enables scrolling for terminal output using a virtual list pattern:

**How it works:**
1. Content is stored as `outputLines: ReactNode[]` (array of line elements)
2. Enables SGR extended mouse mode via escape sequences (`\x1b[?1000h`, `\x1b[?1006h`)
3. Listens to stdin for mouse events (button 64 = scroll up, button 65 = scroll down)
4. `TerminalOutput` renders only visible slice: `outputLines.slice(scrollOffset, scrollOffset + viewportHeight)`
5. Mouse escape sequences are filtered from PromptInput to prevent pollution

**Why virtual list?** Ink doesn't support CSS-like `overflow: hidden` with `marginTop` scrolling. Content must be sliced and re-rendered.

**Usage:**
```typescript
// Hook accepts content info and computes scroll position synchronously
// This avoids flicker when switching agents (no useEffect delay)
const { scrollOffset, scrollUp, scrollDown } = useMouseScroll({
  contentLength: agent.outputLines.length,
  viewportHeight,
  agentId: agent.id,  // Resets to bottom when agent changes
});
```

**Constants:**
- `SCROLL_STEP = 2` - Lines scrolled per input event

## Slash Command Menu

The `CommandMenu` component appears when the user types "/" in the prompt, replacing the StatusBar.

**Features:**
- Shows max 6 filtered commands
- Selected command highlighted in magenta
- Fixed-width command name column for aligned descriptions
- Optional shortcut displayed dimmed after command name

**Filtering:**
Commands are filtered by matching input text against command names. E.g., "/cl" shows "clear" and "compact".

**Execution:**
- Selecting "agents" command opens AgentOverview
- Other commands clear input (placeholder behavior)
