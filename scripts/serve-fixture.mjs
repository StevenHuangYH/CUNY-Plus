import { readFile } from "node:fs/promises"
import { createServer } from "node:http"

const fixture = new URL("../test.html", import.meta.url)
createServer(async (request, response) => {
  if (request.url !== "/" && request.url !== "/test.html") {
    response.writeHead(404).end("Not found")
    return
  }
  try {
    const html = await readFile(fixture)
    response
      .writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      })
      .end(html)
  } catch {
    response.writeHead(500).end("Could not read test.html")
  }
}).listen(4173, "127.0.0.1", () => {
  console.log("CUNY Plus simulator: http://127.0.0.1:4173/test.html")
})
