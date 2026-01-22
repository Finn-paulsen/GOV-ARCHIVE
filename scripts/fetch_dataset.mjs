#!/usr/bin/env node
// Einfaches Node-Skript: Lade eine JSON-URL und speichere sie lokal
// Usage: node scripts/fetch_dataset.mjs <url> [outPath]

import fs from 'fs/promises'

const [, , url, outPath = 'src/data/external.json'] = process.argv

if (!url) {
  console.error('Usage: node scripts/fetch_dataset.mjs <url> [outPath]')
  process.exit(1)
}

async function run() {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    const text = await res.text()

    // Versuche zu parsen; falls kein JSON, speichere rohen Text
    let out = text
    try {
      const json = JSON.parse(text)
      out = JSON.stringify(json, null, 2)
    } catch (err) {
      console.warn('Response is not valid JSON; saving raw text')
    }

    await fs.mkdir('src/data', { recursive: true })
    await fs.writeFile(outPath, out, 'utf8')
    console.log(`Saved data to ${outPath}`)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(2)
  }
}

run()
