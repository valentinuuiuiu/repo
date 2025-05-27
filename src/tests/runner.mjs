import { pathToFileURL } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const tsNode = require('ts-node')

tsNode.register({
  transpileOnly: true,
  esm: true,
  experimentalSpecifierResolution: 'node'
})

await import('./temuToAmazon.test.mts')