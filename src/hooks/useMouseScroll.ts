import { useStdin, useStdout } from "ink";
import { useEffect, useState, useCallback, useRef } from "react";

interface UseMouseScrollOptions {
  contentLength: number;
  viewportHeight: number;
  agentId: string;
}

interface UseMouseScrollResult {
  scrollOffset: number;
  scrollUp: () => void;
  scrollDown: () => void;
}

const SCROLL_STEP = 2;

export function useMouseScroll({ contentLength, viewportHeight, agentId }: UseMouseScrollOptions): UseMouseScrollResult {
  const { stdin } = useStdin();
  const { stdout } = useStdout();

  // Track scroll position from bottom (0 = at bottom, positive = scrolled up)
  const [scrollFromBottom, setScrollFromBottom] = useState(0);
  const prevAgentIdRef = useRef(agentId);

  // Reset to bottom when agent changes
  if (prevAgentIdRef.current !== agentId) {
    prevAgentIdRef.current = agentId;
    setScrollFromBottom(0);
  }

  // Compute maxScroll and scrollOffset synchronously
  const maxScroll = Math.max(0, contentLength - viewportHeight);
  const clampedScrollFromBottom = Math.min(scrollFromBottom, maxScroll);
  const scrollOffset = maxScroll - clampedScrollFromBottom;

  const scrollUp = useCallback(() => {
    setScrollFromBottom(prev => {
      const max = Math.max(0, contentLength - viewportHeight);
      return Math.min(max, prev + SCROLL_STEP);
    });
  }, [contentLength, viewportHeight]);

  const scrollDown = useCallback(() => {
    setScrollFromBottom(prev => Math.max(0, prev - SCROLL_STEP));
  }, []);

  useEffect(() => {
    // Enable mouse tracking (SGR extended mode)
    stdout.write("\x1b[?1000h");
    stdout.write("\x1b[?1006h");

    const handleData = (data: Buffer) => {
      const str = data.toString();

      // SGR mouse format: \x1b[<Cb;Cx;CyM or \x1b[<Cb;Cx;Cym
      // Button 64 = scroll up, Button 65 = scroll down
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
      if (match) {
        const button = parseInt(match[1], 10);
        if (button === 64) {
          scrollUp();
        } else if (button === 65) {
          scrollDown();
        }
      }
    };

    stdin.on("data", handleData);

    return () => {
      stdout.write("\x1b[?1006l");
      stdout.write("\x1b[?1000l");
      stdin.off("data", handleData);
    };
  }, [stdin, stdout, scrollUp, scrollDown]);

  return { scrollOffset, scrollUp, scrollDown };
}
