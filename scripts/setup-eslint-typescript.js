#!/usr/bin/env node
// This script creates symlinks so that @typescript-eslint/* packages,
// ts-api-utils, and @rollup/plugin-typescript use TypeScript 6.x
// (typescript-for-eslint) instead of the root TypeScript 7.x, which has an
// incompatible programmatic API.

'use strict'

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const ts6Path = path.join(rootDir, 'node_modules', 'typescript-for-eslint')

if (!fs.existsSync(ts6Path)) {
  // typescript-for-eslint not installed; skip (e.g. production install with --omit=dev)
  process.exit(0)
}

const symlinks = [
  // A single symlink at the @typescript-eslint scope level makes ALL
  // @typescript-eslint/* packages find TypeScript 6.x via Node.js module resolution.
  path.join(rootDir, 'node_modules', '@typescript-eslint', 'node_modules', 'typescript'),
  // ts-api-utils is outside the @typescript-eslint scope, so it needs its own symlink.
  path.join(rootDir, 'node_modules', 'ts-api-utils', 'node_modules', 'typescript'),
  // @rollup/plugin-typescript uses the TypeScript programmatic API for bundling.
  path.join(rootDir, 'node_modules', '@rollup', 'plugin-typescript', 'node_modules', 'typescript'),
]

for (const linkPath of symlinks) {
  let exists = false
  try {
    fs.lstatSync(linkPath)
    exists = true
  } catch (_) {
    // doesn't exist
  }
  if (exists) continue
  fs.mkdirSync(path.dirname(linkPath), {recursive: true})
  fs.symlinkSync(ts6Path, linkPath, 'junction')
}
