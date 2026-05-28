#!/usr/bin/env node

// Quick test script to verify database server functionality
const path = require("path");
const { spawn } = require("child_process");

console.log("🚀 Testing Database Server...\n");

const serverPath = path.join(__dirname, "database-server.js");
const child = spawn("node", [serverPath], {
  stdio: "pipe",
  cwd: __dirname,
});

let output = "";

child.stdout.on("data", (data) => {
  const text = data.toString();
  output += text;
  console.log(text);

  // If server started successfully, exit after a few seconds
  if (text.includes("Enhanced Database Server running")) {
    console.log("\n✅ Database server started successfully!");
    console.log("🛑 Stopping test server...\n");
    setTimeout(() => {
      child.kill();
      process.exit(0);
    }, 2000);
  }
});

child.stderr.on("data", (data) => {
  console.error("❌ Error:", data.toString());
});

child.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Database server test completed successfully!");
  } else {
    console.log(`❌ Process exited with code ${code}`);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log("⏰ Test timeout - stopping server");
  child.kill();
  process.exit(1);
}, 30000);
