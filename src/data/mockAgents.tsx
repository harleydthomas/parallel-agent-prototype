import { Box, Newline, Text } from "ink";
import type { Agent } from "../types.js";

// Helper components for output styling
function Tool({ name, args }: { name: string; args: string }) {
  return (
    <Text>
      <Text color="green">{"⏺ "}</Text>
      <Text bold>{name}</Text>
      <Text >({args})</Text>
    </Text>
  );
}

function Diff({ type, children }: { type: "add" | "remove"; children: string }) {
  return (
    <Text color={type === "add" ? "green" : "red"}>
      {type === "add" ? "+" : "-"} {children}
    </Text>
  );
}

function Success({ children }: { children: string }) {
  return <Text color="green">✓ {children}</Text>;
}

function Prompt({ children }: { children: string }) {
  return (
    <Text>
      <Text color="blue">{"⏺ "}</Text>
      <Text color="blue">{children}</Text>
      <Newline />
    </Text>
  );
}

function Response({ children }: { children: string }) {
  return (
    <Text>
      <Text color="orange">{"⏺ "}</Text>
      <Text color="orange">{children}</Text>
      <Newline />
    </Text>
  );
}

function Option({ selected, recommended, children }: { selected?: boolean; recommended?: boolean; children: string }) {
  return (
    <Text>
      <Text color={selected ? "cyan" : "gray"}>{selected ? "●" : "○"}</Text>
      <Text> {children}</Text>
      {recommended && <Text dimColor> (Recommended)</Text>}
    </Text>
  );
}

function Code({ children }: { children: string }) {
  return <Text>{children}</Text>;
}

function Comment({ children }: { children: string }) {
  return <Text dimColor>{children}</Text>;
}

export const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Refactor auth",
    status: "working",
    tasks: [
      { id: "1-1", name: "Read existing auth code", status: "completed" },
      { id: "1-2", name: "Extract token logic", status: "completed" },
      { id: "1-3", name: "Create AuthService class", status: "in_progress" },
      { id: "1-4", name: "Update imports", status: "pending" },
      { id: "1-5", name: "Run tests", status: "pending" },
    ],
    output: (
      <Box flexDirection="column" gap={0}>
        <Tool name="Bash" args="bun run src/index.tsx 2>&1 | head -20" />
        <Text>{`
src/
├── index.tsx              # Entry point
├── App.tsx                # Main app component with state & input handling
├── types.ts               # Type definitions
├── data/
│   └── mockAgents.ts      # Mock agent data
└── components/
    ├── index.ts           # Barrel export
    ├── Hotkey.tsx         # Hotkey label component
    ├── StatusIndicator.tsx # Agent & Task status indicators
    ├── AgentList.tsx      # Left pane
    ├── TaskQueue.tsx      # Center pane
    └── TerminalOutput.tsx # Right pane

The app still works the same way. Each component is now self-contained with its own props interface, making them easier to update independently.

✻ Cooked for 1m 12s`}
        </Text>
        <Prompt>Is it possible to have the pane labels be positioned inline with the top border of its containing Box element?</Prompt>
        <Response>Yes, we can achieve a fieldset-legend style by using negative margin to pull the title up into the border. Let me update the components.</Response>
        <Tool name="Read" args="src/components/AgentList.tsx" />
        <Text>{"  ⎿  Read 28 lines"}<Newline /></Text>
        <Tool name="Update" args="src/components/AgentList.tsx" />
        <Text>{"  ⎿  Added 4 lines, removed 2 lines"}</Text>
        <Code>{`
8  export function AgentList({ agents, selectedIndex }: AgentListProps) {
9    return (
10 -    <Box flexDirection="column" padding={1}>
11 -      <Hotkey word="Agents" hotkey="a" />
12      </Box>
13 +    <Box flexDirection="column" paddingX={1}>
14 +      <Box marginTop={-1}>
15 +        <Hotkey word="Agents" hotkey="a" />
16 +      </Box>
17        <Box flexDirection="column" marginTop={1}>
18          {agents.map((agent, index) => (
19            <Box key={agent.id} gap={1}>
20              <Text>{index === selectedIndex ? "▶" : "  "}</Text>
21              <Text inverse={index === selectedIndex}>{agent.name}</Text>
22              <Spacer />
23              <AgentStatusIndicator status={agent.status} />
24            </Box>
25          ))}
26        </Box>
27        <Spacer />
28        <Box marginBottom={-1}>
29          <Hotkey word="New Agent" hotkey="n" />
30        </Box>
31      </Box>
32    );
33  }
`
        }</Code>
      </Box>
    ),
  },
  {
    id: "2",
    name: "Write tests",
    status: "needs_input",
    tasks: [
      { id: "2-1", name: "Identify untested functions", status: "completed" },
      { id: "2-2", name: "Choose test framework", status: "in_progress" },
      { id: "2-3", name: "Write unit tests", status: "pending" },
    ],
    output: (
      <Box flexDirection="column" gap={0}>
        <Prompt>Help me add tests to my project</Prompt>
        <Response>I'll analyze the codebase for test coverage and help you set up testing.</Response>
        <Tool name="Bash" args="npm run coverage" />
        <Text>{`  ⎿  Command completed

----------------------|---------|----------|---------|
File                  | % Stmts | % Branch | % Funcs |
----------------------|---------|----------|---------|
src/utils/format.ts   |   45.2  |    30.0  |   40.0  |
src/utils/validate.ts |   12.5  |     0.0  |   16.6  |
src/api/client.ts     |   67.8  |    55.0  |   70.0  |
----------------------|---------|----------|---------|`}
        </Text>
        <Tool name="Glob" args="**/*.test.ts" />
        <Text>{"  ⎿  No files found"}<Newline /></Text>
        <Text>{"Found "}<Text bold>12 untested functions</Text>{" across 3 files. No test framework is configured yet."}<Newline /></Text>
        <Text color="magenta" bold>? Which test framework would you like to use?</Text>
        <Text> </Text>
        <Option selected recommended>Vitest</Option>
        <Text dimColor>{"    Fast, ESM-native, works with your Vite setup"}</Text>
        <Option>Jest</Option>
        <Text dimColor>{"    Popular, large ecosystem"}</Text>
        <Option>Node.js test runner</Option>
        <Text dimColor>{"    Built-in, zero config"}</Text>
      </Box>
    ),
  },
  {
    id: "3",
    name: "Fix navbar",
    status: "done",
    tasks: [
      { id: "3-1", name: "Find navbar component", status: "completed" },
      { id: "3-2", name: "Fix responsive styles", status: "completed" },
      { id: "3-3", name: "Test on mobile", status: "completed" },
    ],
    output: (
      <Box flexDirection="column" gap={0}>
        <Prompt>The navbar is broken on mobile, can you fix it?</Prompt>
        <Response>I'll investigate the navbar responsive issues and fix them.</Response>
        <Tool name="Grep" args='"navbar" --type tsx' />
        <Text>{`  ⎿  Found 2 files
     src/components/Navbar.tsx
     src/components/Layout.tsx`}<Newline />
        </Text>
        <Tool name="Read" args="src/components/Navbar.tsx" />
        <Text>{"  ⎿  Read 45 lines"}<Newline /></Text>
        <Text>{"Found the issue - the mobile menu has z-index conflicts and the hamburger button isn't visible below 640px."}<Newline /></Text>
        <Tool name="Update" args="src/components/Navbar.tsx" />
        <Text>{"  ⎿  Added 3 lines, removed 1 line"}</Text>
        <Code>{`
45   @media (max-width: 640px) {
46     .nav-menu {
47 -     display: none;
48 +     position: fixed;
49 +     top: 60px;
50 +     z-index: 50;
51     }
52   }
`}</Code>
        <Tool name="Bash" args="npm run build" />
        <Text>{`  ⎿  Command completed

✓ Build completed successfully`}<Newline />
        </Text>
        <Text>{"Done. The navbar now displays correctly on mobile devices."}<Newline /></Text>
        <Text dimColor>{"✻ Cooked for 42s"}</Text>
      </Box>
    ),
  },
  {
    id: "4",
    name: "Update docs",
    status: "working",
    tasks: [
      { id: "4-1", name: "Review README", status: "completed" },
      { id: "4-2", name: "Update API section", status: "in_progress" },
      { id: "4-3", name: "Add examples", status: "pending" },
      { id: "4-4", name: "Check links", status: "pending" },
    ],
    output: (
      <Box flexDirection="column" gap={0}>
        <Prompt>Please update the README with the current API endpoints</Prompt>
        <Response>I'll review the current API and update the documentation.</Response>
        <Tool name="Read" args="README.md" />
        <Text>{"  ⎿  Read 156 lines"}<Newline /></Text>
        <Tool name="Read" args="src/api/endpoints.ts" />
        <Text>{"  ⎿  Read 89 lines"}<Newline /></Text>
        <Text>{"The README references outdated endpoints. I'll update the API section to match the current implementation."}<Newline /></Text>
        <Tool name="Update" args="README.md" />
        <Text>{"  ⎿  Added 18 lines, removed 12 lines"}</Text>
        <Code>{`
## API Endpoints

### Authentication

\`\`\`
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
\`\`\`

### Users

\`\`\`
GET    /api/users
GET    /api/users/:id
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
\`\`\`
`}</Code>
        <Text dimColor>{"Adding usage examples..."}</Text>
      </Box>
    ),
  },
];
