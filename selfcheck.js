const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const port = 4567;
const serverPath = path.join(__dirname, "serve.js");
const dataFile = path.join(os.tmpdir(), "ayi-pay-selfcheck.json");
fs.writeFileSync(dataFile, JSON.stringify({ month: "2026-10", restDays: {} }));
const server = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: String(port), DATA_FILE: dataFile } });

async function request(method, body) {
  const response = await fetch(`http://127.0.0.1:${port}/data`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.text() };
}

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const badSave = await request("POST", { month: "2026-10", days: {} });
  assert.equal(badSave.status, 400);
  const goodSave = await request("POST", { month: "2026-10", restDays: { "2026-10-01": true } });
  assert.equal(goodSave.status, 200);
  const loaded = JSON.parse((await request("GET")).body);
  assert.equal(loaded.restDays["2026-10-01"], true);
  console.log("selfcheck ok");
  server.kill();
})().catch((error) => {
  console.error(error);
  server.kill();
  process.exitCode = 1;
}).finally(() => {
  fs.rmSync(dataFile, { force: true });
});
