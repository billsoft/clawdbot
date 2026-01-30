import { Type } from "@sinclair/typebox";
import type { AnyAgentTool } from "./common.js";
import { jsonResult, readNumberParam, readStringParam, readStringArrayParam } from "./common.js";
import { stringEnum } from "../schema/typebox.js";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

const execAsync = promisify(exec);

const DESKTOP_TOOL_ACTIONS = [
  "mouse_move",
  "mouse_click",
  "mouse_drag",
  "mouse_scroll",
  "keyboard_type",
  "keyboard_press",
  "screen_size",
  "screenshot",
] as const;

const MOUSE_BUTTONS = ["left", "right", "middle"] as const;

const DesktopToolSchema = Type.Object({
  action: stringEnum(DESKTOP_TOOL_ACTIONS),
  // mouse_move / mouse_drag
  x: Type.Optional(Type.Number()),
  y: Type.Optional(Type.Number()),
  // mouse_click
  button: Type.Optional(stringEnum(MOUSE_BUTTONS)),
  double: Type.Optional(Type.Boolean()),
  // mouse_scroll
  amount: Type.Optional(Type.Number()),
  direction: Type.Optional(stringEnum(["up", "down", "left", "right"])),
  // keyboard_type
  text: Type.Optional(Type.String()),
  delay: Type.Optional(Type.Number()),
  // keyboard_press
  keys: Type.Optional(Type.Array(Type.String())),
  // screenshot
  path: Type.Optional(Type.String()),
});

async function runPyAutoGUI(script: string) {
  // Use .venv python if available, otherwise system python3
  const venvPython = path.resolve(process.cwd(), ".venv/bin/python3");
  const hasVenv = await fs
    .stat(venvPython)
    .then(() => true)
    .catch(() => false);
  const pythonCmd = hasVenv ? `"${venvPython}"` : "python3";

  // Create a temporary script file
  const scriptPath = `/tmp/clawdbot-desktop-${Date.now()}.py`;
  const fullScript = `
import pyautogui
import sys
import json

# Fail safe
pyautogui.FAILSAFE = True

try:
${script
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
`;
  await fs.writeFile(scriptPath, fullScript);

  try {
    const { stdout, stderr } = await execAsync(`${pythonCmd} "${scriptPath}"`);
    if (stderr && !stderr.includes("UserWarning")) {
      // PyAutoGUI often warns on macOS
      // console.warn(stderr);
    }
    try {
      return JSON.parse(stdout.trim() || "{}");
    } catch {
      return { stdout };
    }
  } finally {
    await fs.unlink(scriptPath).catch(() => {});
  }
}

export function createDesktopTool(): AnyAgentTool {
  return {
    label: "Desktop Control",
    name: "desktop",
    description:
      "Control the local computer's mouse and keyboard to interact with desktop applications (outside the browser). Use this to click system UI, type in native apps, or take screenshots. Actions: mouse_move(x,y), mouse_click(button, double), mouse_drag(x,y), keyboard_type(text), keyboard_press(keys), screenshot.",
    parameters: DesktopToolSchema,
    execute: async (_toolCallId, args) => {
      const params = args as Record<string, unknown>;
      const action = readStringParam(params, "action", { required: true });

      switch (action) {
        case "mouse_move": {
          const x = readNumberParam(params, "x", { required: true });
          const y = readNumberParam(params, "y", { required: true });
          await runPyAutoGUI(`pyautogui.moveTo(${x}, ${y})`);
          return jsonResult({ ok: true, x, y });
        }
        case "mouse_click": {
          const buttonRaw = readStringParam(params, "button") || "left";
          const double = params.double === true;
          const clicks = double ? 2 : 1;
          await runPyAutoGUI(`pyautogui.click(button='${buttonRaw}', clicks=${clicks})`);
          return jsonResult({ ok: true, button: buttonRaw, double });
        }
        case "mouse_drag": {
          const x = readNumberParam(params, "x", { required: true });
          const y = readNumberParam(params, "y", { required: true });
          await runPyAutoGUI(`pyautogui.dragTo(${x}, ${y}, button='left')`);
          return jsonResult({ ok: true, action: "drag", x, y });
        }
        case "mouse_scroll": {
          const amount = readNumberParam(params, "amount") || 100;
          // pyautogui scroll is vertical. hscroll is horizontal (if supported).
          // on macOS scroll amount is different.
          await runPyAutoGUI(`pyautogui.scroll(${amount})`);
          return jsonResult({ ok: true, amount });
        }
        case "keyboard_type": {
          const text = readStringParam(params, "text", { required: true });
          // Escape text for python string
          const safeText = JSON.stringify(text);
          await runPyAutoGUI(`pyautogui.write(${safeText}, interval=0.05)`);
          return jsonResult({ ok: true, textLength: text.length });
        }
        case "keyboard_press": {
          const keys = readStringArrayParam(params, "keys", { required: true });
          // Map some keys if necessary, but pyautogui names are standard
          const safeKeys = JSON.stringify(keys);
          await runPyAutoGUI(`
for key in ${safeKeys}:
    pyautogui.press(key)
`);
          return jsonResult({ ok: true, keys });
        }
        case "screen_size": {
          const res = await runPyAutoGUI(`
width, height = pyautogui.size()
print(json.dumps({"width": width, "height": height}))
`);
          return jsonResult(res);
        }
        case "screenshot": {
          const path = readStringParam(params, "path") || `/tmp/screenshot-${Date.now()}.png`;
          const safePath = JSON.stringify(path);
          await runPyAutoGUI(`pyautogui.screenshot(${safePath})`);
          return jsonResult({ ok: true, path });
        }
        default:
          throw new Error(`Unknown desktop action: ${action}`);
      }
    },
  };
}
