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
- **Ctrl+A** - Toggle AgentOverview panel
- **q** - Quit
- **Enter** - Submit prompt

### AgentOverview
- **Ctrl+A** - Close AgentOverview
- **Escape** - Close AgentOverview
- **↑/↓** - Navigate agent list
- **q** - Quit

## Architecture

Terminal UI built with Ink (React for CLIs). Main view shows terminal output with prompt input; Ctrl+A toggles the AgentOverview panel.

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
    ├── Hotkey.tsx         # Hotkey label with highlighted key
    ├── StatusIndicator.tsx # Agent, Task & AgentStatusCount indicators
    ├── StatusBar.tsx      # Bottom bar with context-specific content
    ├── UsageBar.tsx       # Usage meter component
    ├── PromptInput.tsx    # Text input with prompt prefix
    ├── AgentOverview.tsx  # Two-column agent/task panel
    ├── AgentList.tsx      # Agent list with status
    ├── TaskQueue.tsx      # Task list for selected agent
    └── TerminalOutput.tsx # Terminal output display
```

## UI Patterns

- **Pane labels** use `marginTop={-1}` to sit inline with top border (fieldset-legend style)
- **Bottom hotkeys** use `marginBottom={-1}` with `<Spacer />` to align with bottom border
- **Hotkey component** highlights a single letter in red to indicate the keyboard shortcut
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
  output: ReactNode;  // JSX elements for rich terminal output
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

## Mouse Scroll

The `useMouseScroll` hook enables mouse wheel scrolling for terminal output:

**How it works:**
1. Enables SGR extended mouse mode via escape sequences (`\x1b[?1000h`, `\x1b[?1006h`)
2. Listens to stdin for mouse events (button 64 = scroll up, button 65 = scroll down)
3. Updates `scrollOffset` state which shifts content via `marginTop={-scrollOffset}`
4. Mouse escape sequences are filtered from TextInput to prevent pollution

**Usage:**
```typescript
const { scrollOffset, resetScroll } = useMouseScroll();

// Reset scroll when changing agents
useEffect(() => {
  resetScroll();
}, [selectedIndex]);
```

**Constants:**
- `SCROLL_STEP = 2` - Lines scrolled per wheel event
