import { useStdin, useStdout } from "ink";
import { useEffect, useState, useCallback, useRef } from "react";

interface UseMouseScrollResult {
  scrollOffset: number;
  resetScroll: () => void;
}

const SCROLL_STEP = 2;

export function useMouseScroll(): UseMouseScrollResult {
  const { stdin } = useStdin();
  const { stdout } = useStdout();
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollTime = useRef(0);

  const resetScroll = useCallback(() => {
    setScrollOffset(0);
  }, []);

  useEffect(() => {
    // Enable mouse tracking (SGR extended mode)
    stdout.write("\x1b[?1000h"); // Enable mouse click tracking
    stdout.write("\x1b[?1006h"); // Enable SGR extended mouse mode

    const handleData = (data: Buffer) => {
      const now = Date.now();
      const str = data.toString();
      // SGR mouse format: \x1b[<Cb;Cx;CyM or \x1b[<Cb;Cx;Cym
      // Button 64 = scroll up, Button 65 = scroll down
      const match = str.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/);
      if (match) {
        const button = parseInt(match[1], 10);
        if (button === 64) {
          // Scroll wheel up - show earlier content
          lastScrollTime.current = now;
          setScrollOffset((prev) => prev + SCROLL_STEP);
        } else if (button === 65) {
          // Scroll wheel down - show later content
          lastScrollTime.current = now;
          setScrollOffset((prev) => Math.max(0, prev - SCROLL_STEP));
        }
      }
    };

    stdin.on("data", handleData);

    return () => {
      // Disable mouse tracking on cleanup
      stdout.write("\x1b[?1006l"); // Disable SGR mode
      stdout.write("\x1b[?1000l"); // Disable mouse tracking
      stdin.off("data", handleData);
    };
  }, [stdin, stdout]);

  return { scrollOffset, resetScroll };
}
