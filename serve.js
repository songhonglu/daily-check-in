const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const port = Number(process.env.PORT) || 4399;
const root = __dirname;
const dataFile = process.env.DATA_FILE || path.join(root, "data.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return { month: "", rate: 300, days: {} };
  }
}

http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/data") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(readData()));
    return;
  }
  if (request.method === "POST" && request.url === "/data") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1000000) request.destroy();
    });
    request.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (!data || typeof data !== "object" || typeof data.restDays !== "object" || data.restDays === null) throw new Error("invalid");
        fs.writeFileSync(dataFile, JSON.stringify(data));
        response.writeHead(200).end("ok");
      } catch {
        response.writeHead(400).end("bad request");
      }
    });
    return;
  }
  const target = path.join(root, request.url === "/" ? "index.html" : request.url);
  fs.readFile(target, (error, content) => {
    if (error) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(content);
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`http://127.0.0.1:${port}`);
  const localAddress = Object.values(os.networkInterfaces()).flat().find((item) => item?.family === "IPv4" && !item.internal)?.address;
  if (localAddress) console.log(`手机访问：http://${localAddress}:${port}`);
});
