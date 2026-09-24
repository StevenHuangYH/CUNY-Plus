// Backport the no-CORS behavior for GHSA-qm9p-f9j5-w83w to Plasmo's Parcel 2.9.3.
// See docs/maintenance/dependency-security.md before changing these hashes.
import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const configRequire = createRequire(require.resolve("@plasmohq/parcel-config"))
const parcelRequire = createRequire(
  configRequire.resolve("@parcel/config-default")
)
const entry = parcelRequire.resolve("@parcel/reporter-dev-server")
const { version } = parcelRequire("@parcel/reporter-dev-server/package.json")
const originalHash =
  "45b089610ba6c0b91fdc3f963f0ffd6c15dda0944636afee2cd24d904c601d02"
const patchedHash =
  "83af9d1459abb5c341f757cf8a9a6530368a02efea7390ef7aa016af324201f5"
const sha256 = (source) => createHash("sha256").update(source).digest("hex")
const source = await readFile(entry, "utf8")
const hash = sha256(source)

if (version !== "2.9.3" || ![originalHash, patchedHash].includes(hash)) {
  throw new Error(
    "Parcel reporter changed. Review its CORS security before updating the patch."
  )
}

if (hash === originalHash) {
  if (process.argv.includes("--check")) {
    throw new Error(
      "Parcel CORS patch is missing. Run npm run postinstall before building or developing."
    )
  }
  let patched = source
  for (const header of [
    '    res.setHeader("Access-Control-Allow-Origin", "*");\n',
    '    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, PUT, PATCH, POST, DELETE");\n',
    '    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Type");\n'
  ]) {
    patched = patched.replace(header, "")
  }
  if (sha256(patched) !== patchedHash)
    throw new Error("Unexpected Parcel CORS patch output")
  await writeFile(entry, patched)
}

console.log("Parcel 2.9.3 CORS security patch verified.")
