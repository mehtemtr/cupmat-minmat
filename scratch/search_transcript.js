const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logPath = 'C:\\Users\\pc\\.gemini\\antigravity\\brain\\7f6a0bb8-1272-4502-a25f-41f870c067dd\\.system_generated\\logs\\transcript.jsonl';

async function run() {
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log("=== Matching Lines ===");
  for await (const line of rl) {
    if (line.toLowerCase().includes("gol") || line.toLowerCase().includes("simül") || line.toLowerCase().includes("asist") || line.toLowerCase().includes("ver")) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'USER_INPUT') {
          console.log(`[USER] Step ${obj.step_index}: ${obj.content}`);
        } else if (obj.type === 'PLANNER_RESPONSE' && obj.content) {
          // print snippet of assistant response
          console.log(`[AGENT] Step ${obj.step_index}: ${obj.content.substring(0, 150)}...`);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }
}
run();
