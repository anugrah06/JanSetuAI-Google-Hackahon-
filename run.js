const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("\x1b[36m%s\x1b[0m", "==================================================");
console.log("\x1b[1m\x1b[33m%s\x1b[0m", "       🚀 JanSetu AI — Starting Dev Servers       ");
console.log("\x1b[36m%s\x1b[0m", "==================================================");

const rootDir = __dirname;
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "frontend");

// Determine Python executable
let pythonCmd = "python";
const venvWindows = path.join(backendDir, "venv", "Scripts", "python.exe");
const venvUnix = path.join(backendDir, "venv", "bin", "python");

if (fs.existsSync(venvWindows)) {
  pythonCmd = venvWindows;
} else if (fs.existsSync(venvUnix)) {
  pythonCmd = venvUnix;
}

console.log(`[JanSetu] Using Python: ${pythonCmd}`);

// 1. Start FastAPI Backend Server
console.log("\x1b[32m%s\x1b[0m", "[Backend] Launching FastAPI on http://127.0.0.1:8000 ...");
const backendProcess = spawn(
  pythonCmd,
  ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
  {
    cwd: backendDir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  }
);

backendProcess.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[32m[Backend]\x1b[0m ${data.toString()}`);
});

backendProcess.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[32m[Backend]\x1b[0m ${data.toString()}`);
});

backendProcess.on("error", (err) => {
  console.error("\x1b[31m%s\x1b[0m", `[Backend Error] Failed to start: ${err.message}`);
});

backendProcess.on("exit", (code) => {
  if (code !== null && code !== 0) {
    console.log("\x1b[31m%s\x1b[0m", `[Backend] Exited with code ${code}`);
  }
});

// 2. Start Next.js Frontend Server
console.log("\x1b[34m%s\x1b[0m", "[Frontend] Launching Next.js on http://localhost:3000 ...");
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const frontendProcess = spawn(
  npmCmd,
  ["run", "dev", "--", "-p", "3000"],
  {
    cwd: frontendDir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  }
);

frontendProcess.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[34m[Frontend]\x1b[0m ${data.toString()}`);
});

frontendProcess.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[34m[Frontend]\x1b[0m ${data.toString()}`);
});

frontendProcess.on("error", (err) => {
  console.error("\x1b[31m%s\x1b[0m", `[Frontend Error] Failed to start: ${err.message}`);
});

frontendProcess.on("exit", (code) => {
  if (code !== null && code !== 0) {
    console.log("\x1b[31m%s\x1b[0m", `[Frontend] Exited with code ${code}`);
  }
});

// Graceful cleanup on SIGINT (Ctrl+C)
function cleanup() {
  console.log("\n[JanSetu] Shutting down all servers...");
  try {
    if (backendProcess && !backendProcess.killed) {
      if (isWindows) {
        spawn("taskkill", ["/pid", backendProcess.pid.toString(), "/f", "/t"]);
      } else {
        backendProcess.kill("SIGTERM");
      }
    }
  } catch (e) {}

  try {
    if (frontendProcess && !frontendProcess.killed) {
      if (isWindows) {
        spawn("taskkill", ["/pid", frontendProcess.pid.toString(), "/f", "/t"]);
      } else {
        frontendProcess.kill("SIGTERM");
      }
    }
  } catch (e) {}

  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
