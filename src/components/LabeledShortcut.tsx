import { Text } from "ink";
import { ReactElement } from "react";

interface LabeledShortcutProps {
  children: ReactElement;
  hotkey: string;
}

export function LabeledShortcut({ children, hotkey }: LabeledShortcutProps) {
  return (
    <Text>
        {children}
        <Text dimColor> {hotkey}</Text>
    </Text>
  );
}
