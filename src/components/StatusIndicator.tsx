import { Text } from "ink";
import type { AgentStatus, TaskStatus } from "../types.js";
import { LabeledShortcut } from "./LabeledShortcut.js";

export function AgentStatusIndicator({ status }: { status: AgentStatus }) {
  switch (status) {
    case "working":
      return <Text>Working<Text color="yellow"> ●</Text></Text>;
    case "needs_input":
      return <Text>Waiting<Text color="red"> ●</Text></Text>;
    case "done":
      return <Text>Done<Text color="green"> ●</Text></Text>;
  }
}

export function TaskStatusIndicator({ status }: { status: TaskStatus }) {
  switch (status) {
    case "completed":
      return <Text color="green">✓</Text>;
    case "in_progress":
      return <Text color="yellow">●</Text>;
    case "pending":
      return <Text color="gray">○</Text>;
  }
}

export function AgentStatusCount({ status, count }: { status: AgentStatus; count: number }) {
  switch (status) {
    case "working":
      return <Text color="yellow" bold>● {count} Working</Text>;
    case "needs_input":
      return (
        <LabeledShortcut hotkey="shift+⌥A">
          <Text color="red" bold>● {count} Waiting</Text>
        </LabeledShortcut>
      );
    case "done":
      return <Text color="green" bold>● {count} Done</Text>;
  }
}
