import { render } from "ink";
import { App } from "./App.js";

// Enter alternate screen buffer
process.stdout.write("\x1b[?1049h");

const { waitUntilExit } = render(<App />);

waitUntilExit().then(() => {
  // Exit alternate screen buffer
  process.stdout.write("\x1b[?1049l");
});
