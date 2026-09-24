import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

const require = createRequire(import.meta.url)
const configRequire = createRequire(require.resolve("@plasmohq/parcel-config"))
const parcelRequire = createRequire(
  configRequire.resolve("@parcel/config-default")
)
const reporter = parcelRequire("@parcel/reporter-dev-server").default
const { report } = reporter[Symbol.for("parcel-plugin-config")]
const { NodeFS } = require("@parcel/fs")

async function unusedPort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const { port } = server.address()
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  )
  return port
}

test(
  "Parcel serves local source without allowing arbitrary website reads",
  { timeout: 10000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "cuny-parcel-cors-"))
    const port = await unusedPort()
    const fs = new NodeFS()
    const options = {
      projectRoot: root,
      cacheDir: root,
      inputFS: fs,
      outputFS: fs,
      serveOptions: { port, host: "127.0.0.1", distDir: root },
      hmrOptions: false
    }
    const logger = {
      warn: (message) => {
        throw new Error(JSON.stringify(message))
      },
      verbose() {}
    }
    const send = (event) => report({ event, options, logger })
    let started = false
    try {
      await writeFile(join(root, "source.js"), "const privateSource = 42;\n")
      await send({ type: "watchStart" })
      started = true
      await send({
        type: "buildSuccess",
        bundleGraph: { getBundles: () => [] }
      })
      const url = `http://127.0.0.1:${port}/__parcel_source_root/source.js`
      for (const origin of [
        "https://attacker.example",
        "null",
        undefined,
        `http://127.0.0.1:${port}`
      ]) {
        const response = await fetch(url, {
          headers: origin ? { Origin: origin } : {},
          signal: AbortSignal.timeout(3000)
        })
        assert.equal(response.status, 200)
        assert.equal(await response.text(), "const privateSource = 42;\n")
        assert.equal(
          response.headers.get("access-control-allow-origin"),
          null,
          `Source must not grant cross-origin access for ${origin}`
        )
      }
    } finally {
      if (started) await send({ type: "watchEnd" })
      await rm(root, { recursive: true, force: true })
    }
  }
)
