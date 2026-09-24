# Dependency security maintenance

Tracking: [Issue #2](https://github.com/StevenHuangYH/CUNY-Plus/issues/2).

The 2026-09-24 baseline audit reported 79 affected packages: 72 high and 7 moderate. After the updates, npm reports 4 moderate findings and no high findings. All four remaining entries share one advisory, [GHSA-qm9p-f9j5-w83w](https://github.com/advisories/GHSA-qm9p-f9j5-w83w): `@parcel/reporter-dev-server`, with inherited findings in `@parcel/config-default`, `@plasmohq/parcel-config`, and `plasmo`.

## Compatible fixes

PostCSS is updated to 8.5.28 and Vitest to 4.1.11. The latter is a [patched release for the mocker path traversal advisory](https://github.com/advisories/GHSA-82fw-gwwq-j7x9). Vite is explicitly pinned to 6.4.3, which satisfies Vitest's peer range and preserves the existing esbuild JSX configuration. The test configuration uses `.mts` to declare its ESM module format, and is included in TypeScript checking.

Plasmo remains at 0.90.5. Its dependencies include exact old versions, so `package.json` uses [npm overrides](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#overrides):

| Override                                       | Reason                                                                                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@parcel/core` 2.9.3                           | Keep Plasmo's private Parcel API compatible and avoid multiple core implementations being selected through peer dependencies.                |
| `@plasmohq/parcel-resolver-post` 0.4.6         | Use its updated tsup dependency and patched esbuild.                                                                                         |
| `@plasmohq/parcel-transformer-manifest` 0.21.1 | Use the upstream transformer update for the patched CSP parser, including its changed Map API.                                               |
| `browserslist` 4.29.1                          | Replace the vulnerable pinned copy in the inline CSS transformer.                                                                            |
| `fflate` 0.8.3                                 | Fix malformed ZIP64 archive handling.                                                                                                        |
| `htmlnano` 2.0.3                               | Use the SVGO 2 peer range supported by Parcel 2.9.3's HTML optimizer; newer htmlnano versions require SVGO 3.                                |
| `msgpackr` 1.12.1                              | Replace LMDB's vulnerable pinned serializer without changing its major version.                                                              |
| `sharp` 0.35.4                                 | Update the bundled image-processing libraries.                                                                                               |
| `svelte` 5.57.1                                | Remove advisories in the compiler installed transitively by Plasmo. This is a React project; no Svelte application compatibility is claimed. |
| `svgo@^2` 2.8.4                                | Apply the security patch while retaining the major version used by Parcel and SVGR.                                                          |

The lockfile also records compatible updates to transitive dependencies such as js-yaml and baseline-browser-mapping. Do not run `npm audit fix --force`: the suggested Plasmo downgrade does not represent a reviewed migration for this project.

## Parcel CORS backport

Upstream Parcel 2.16.4 provides a no-CORS option for the remaining advisory. Its plugins require the newer Parcel core, while Plasmo's fork imports private APIs removed from that core. Upgrading only the reporter fails its version check; upgrading the core also fails because `registerCoreWithSerializer` is no longer exported.

`scripts/patch-parcel-cors.mjs` therefore applies the no-CORS behavior to the installed 2.9.3 reporter: it removes the three permissive `Access-Control-Allow-*` response headers from the shared HTTP/HMR header helper. Same-origin requests and direct local requests still work. Arbitrary websites no longer receive permission to read those responses through browser CORS. This does not make the development server an authenticated service or authorize exposing it publicly.

The patch runs after `npm install` and `npm ci`. It checks the package version and full SHA-256 of the original/patched entry before writing, is idempotent, and fails on an unknown file. `npm run dev`, `npm run build`, and `npm run package` verify the patched hash before running. An installation with scripts disabled needs `npm run postinstall` before those commands work.

`tests/parcel-cors.test.mjs` starts the actual installed reporter, serves a temporary source file through `/__parcel_source_root`, and checks malicious, null, same-origin, and absent Origin headers. It failed against the unpatched package's wildcard header, then passed after the patch. The test runs as part of `npm test` and cleans up its server and temporary files.

`npm audit` remains unsuppressed and exits nonzero with the four version-based entries because it cannot inspect local patches. This is **not a zero-audit result**. Keep the advisory tracked until a compatible upstream release replaces the patch. Reassess any new advisory independently; this patch only addresses the cited CORS behavior.

## Validation

Completed on Windows with Node 24.18.0 and npm 11.16.0 on 2026-09-24:

- Clean `npm ci` applied the patch automatically; `npm ls --all` reported a valid tree.
- `npm test` passed 22 application tests and the HTTP security regression test (23 total); `npm run typecheck` passed.
- Production build, ZIP packaging, and development build passed. The generated ZIP manifest matched the production manifest.
- Production permissions remained `storage`, CUNY hosts, and RateMyProfessors hosts. Both content scripts and generated icons were present. Only the development ratings entry included localhost simulator matches.
- Independent Standards and Spec/security reviews found no unresolved issues.
- `npm audit` reported 0 high and 4 moderate entries, all for the locally patched Parcel CORS advisory; it still exits nonzero.

Real Chrome interactions and live CUNY/RateMyProfessors checks were explicitly waived by the user and are not counted as executed tests.
