import { useStdin, useStdout } from "ink";
import { useEffect, useState, useCallback, useRef } from "react";

interface UseMouseScrollResult {
  scrollOffset: number;
  scrollUp: () => void;
  scrollDown: () => void;
  setContentLength: (length: number, viewportHeight: number) => void;
  resetScroll: () => void;
}

const SCROLL_STEP = 3;

export function useMouseScroll(): UseMouseScrollResult {
  const { stdin } = useStdin();
  const { stdout } = useStdout();
  const [scrollOffset, setScrollOffset] = useState(0);
  const maxScrollRef = useRef(0);

  const setContentLength = useCallback((length: number, viewportHeight: number) => {
    const newMax = Math.max(0, length - viewportHeight);
    maxScrollRef.current = newMax;
    // Clamp current scroll to new max
    setScrollOffset(prev => Math.min(prev, newMax));
  }, []);

  const resetScroll = useCallback(() => {
    setScrollOffset(0);
  }, []);

  const scrollUp = useCallback(() => {
    setScrollOffset(prev => Math.max(0, prev - SCROLL_STEP));
  }, []);

  const scrollDown = useCallback(() => {
    setScrollOffset(prev => Math.min(maxScrollRef.current, prev + SCROLL_STEP));
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

  return { scrollOffset, scrollUp, scrollDown, setContentLength, resetScroll };
}
