// PostToolUse hook: formats a file with Prettier after Claude edits or writes it.
// Claude Code sends the event JSON on stdin. The result goes to format.log and to the transcript.

import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const FORMATTED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md"]);
const SKIPPED_DIRECTORIES = new Set(["node_modules", ".next"]);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const logFile = join(projectDir, ".claude", "hooks", "format.log");

function log(line: string) {
  mkdirSync(dirname(logFile), { recursive: true });
  appendFileSync(logFile, `${new Date().toISOString()} ${line}\n`);
}

// A systemMessage on stdout is shown to the user in the transcript.
function report(message: string) {
  console.log(JSON.stringify({ systemMessage: message }));
}

async function main() {
  // readFileSync(0) reads the event from stdin. Bun.stdin.json() can end silently when stdin is a file.
  const input = JSON.parse(readFileSync(0, "utf8")) as { tool_input?: { file_path?: string } };
  const filePath = input.tool_input?.file_path;
  if (!filePath) return;

  const absolute = resolve(filePath);
  const rel = relative(projectDir, absolute);
  const inSkippedDirectory = rel.split(sep).some((segment) => SKIPPED_DIRECTORIES.has(segment));
  if (!FORMATTED_EXTENSIONS.has(extname(absolute)) || inSkippedDirectory) return;

  const before = readFileSync(absolute, "utf8");
  const prettier = Bun.spawnSync([process.execPath, "x", "prettier", "--write", absolute], {
    cwd: projectDir,
    stdout: "pipe",
    stderr: "pipe",
  });

  if (prettier.exitCode !== 0) {
    const error = prettier.stderr.toString().split("\n")[0].trim();
    log(`FAILED ${rel}: ${error}`);
    report(`Prettier could not format ${rel}: ${error}`);
    return;
  }

  const changed = readFileSync(absolute, "utf8") !== before;
  log(`${changed ? "formatted" : "unchanged"} ${rel}`);
  report(changed ? `Formatted ${rel}` : `${rel} was already formatted`);
}

// Exit 0 even on errors, so a formatting problem never blocks Claude's edit.
main()
  .catch((error: unknown) => {
    log(`ERROR ${error instanceof Error ? error.message : String(error)}`);
  })
  .finally(() => process.exit(0));
