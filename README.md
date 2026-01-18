# Claude Code Multi-Agent UI

A design prototype exploring multi-agent orchestration UI for Claude Code. This project visualizes and manages multiple AI agents running in parallel within a single interactive terminal instance.

Built as a portfolio project demonstrating product design thinking for complex AI tooling interfaces.

![Overview](https://github.com/user-attachments/assets/2b030aab-63ba-484e-a5ff-13475709b154)

## Features

- **Multi-agent management** - View and switch between multiple concurrent AI agents
- **Real-time status tracking** - Visual indicators for agent states (working, waiting, done)
- **Task queue visualization** - See each agent's planned tasks and progress
- **Virtual scrolling** - Efficient rendering of long terminal output
- **Keyboard-first navigation** - Full keyboard control with intuitive shortcuts
- **Slash command menu** - Quick access to commands via `/` prefix
- **Option selection UI** - Navigate and select from agent-provided choices

## Tech Stack

- **[Ink](https://github.com/vadimdemedes/ink)** - React for interactive command-line apps
- **[React 19](https://react.dev/)** - UI component library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-code.git
cd claude-code

# Install dependencies
bun install

# Run the application
bun start
```

## Keyboard Shortcuts

### Main View
| Key | Action |
|-----|--------|
| `↑/↓` | Scroll output or navigate options |
| `/` | Open command menu |
| `Option+A` | Toggle agent overview panel |
| `Shift+Option+A` | Cycle through agents by status |
| `Ctrl+U` | Clear input |
| `Enter` | Submit prompt |
| `Ctrl+C` | Quit |

### Agent Overview
| Key | Action |
|-----|--------|
| `Option+↑/↓` | Select previous/next agent |
| `Option+1-9` | Quick select agent by number |
| `Escape` | Close panel |

### Command Menu
| Key | Action |
|-----|--------|
| `↑/↓` | Navigate commands |
| `Enter` | Execute command |
| `Escape` | Close menu |

## Project Structure

```
src/
├── index.tsx              # Entry point
├── App.tsx                # Main app with state management
├── types.ts               # TypeScript type definitions
├── data/
│   └── mockAgents.tsx     # Mock agent data with JSX output
├── hooks/
│   └── useMouseScroll.ts  # Mouse scroll handling
└── components/
    ├── AgentList.tsx      # Agent list with status indicators
    ├── AgentOverview.tsx  # Two-column agent/task panel
    ├── Code.tsx           # Syntax highlighting
    ├── CommandMenu.tsx    # Slash command menu
    ├── PromptInput.tsx    # Text input component
    ├── StatusBar.tsx      # Bottom status bar
    ├── TaskQueue.tsx      # Task list for selected agent
    └── TerminalOutput.tsx # Main output display
```

## Scripts

```bash
bun start      # Run the application
bun run dev    # Run the application (alias)
bun run lint   # Run ESLint
bun run lint:fix # Run ESLint with auto-fix
bun run typecheck # Run TypeScript type checking
```

## Design Decisions

### Virtual List Scrolling
Ink doesn't support CSS-like overflow scrolling, so content is virtualized by slicing the output array and rendering only visible lines. Mouse scroll events are captured via SGR extended mouse mode.

### Status Priority
Agents are cycled in priority order: `needs_input` → `done`. Working agents are excluded from cycling unless all agents are working. This ensures agents requiring attention are surfaced first.

### Keyboard-First Design
All interactions are accessible via keyboard shortcuts, following terminal UI conventions. Mouse scroll is supported as a convenience.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*This is a design prototype and portfolio project. It demonstrates UI/UX concepts for multi-agent AI orchestration interfaces.*
