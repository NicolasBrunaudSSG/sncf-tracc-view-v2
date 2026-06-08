/**
 * hash-data.js — Copie les GeoJSON dans dist/data/ avec hash de contenu
 * et génère dist/data/manifest.json
 *
 * Usage : node scripts/hash-data.js <src-dir> <dest-dir>
 *   src-dir  : répertoire contenant les GeoJSON (app/data/)
 *   dest-dir : dist/data/
 */
import { createHash } from 'crypto'
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

const [, , srcDir, destDir] = process.argv
if (!srcDir || !destDir) {
  console.error('Usage: node hash-data.js <src-dir> <dest-dir>')
  process.exit(1)
}

mkdirSync(destDir, { recursive: true })
mkdirSync(join(destDir, 'infra'), { recursive: true })

const FILES = [
  'reseau_national.geojson',
  'hev_reference.geojson',
  'hev_2050.geojson',
  'hev_2065.geojson',
  'hev_2100.geojson',
  'carroyage_light.geojson',
]

const INFRA_FILES = [
  'liste-des-gares.geojson',
  'liste-des-passerelles.geojson',
  'liste-des-ponts-route.geojson',
  'liste-ouvrages-en-terre.geojson',
]

const manifest = {}

function hashFile(filePath) {
  const buf = readFileSync(filePath)
  return createHash('sha256').update(buf).digest('hex').slice(0, 8)
}

function processFile(srcPath, destSubDir, logicalKey) {
  if (!existsSync(srcPath)) {
    console.warn(`SKIP: ${srcPath} not found`)
    return
  }
  const hash = hashFile(srcPath)
  const name = basename(srcPath)
  const ext = name.endsWith('.geojson') ? '.geojson' : '.json'
  const stem = name.replace(ext, '')
  const hashedName = `${stem}.${hash}${ext}`
  const destPath = join(destSubDir, hashedName)
  copyFileSync(srcPath, destPath)
  manifest[logicalKey] = hashedName
  console.log(`  ${logicalKey} → ${hashedName} (${Math.round(readFileSync(srcPath).length / 1024)} KB)`)
}

console.log('Hashing GeoJSON files...')

for (const f of FILES) {
  const stem = f.replace('.geojson', '')
  processFile(join(srcDir, f), destDir, stem)
}

for (const f of INFRA_FILES) {
  const stem = f.replace('.geojson', '')
  processFile(join(srcDir, 'infra', f), join(destDir, 'infra'), `infra/${stem}`)
}

// metadata.json sans hash (petit fichier, mis à jour fréquemment)
const metaSrc = join(srcDir, 'metadata.json')
if (existsSync(metaSrc)) {
  copyFileSync(metaSrc, join(destDir, 'metadata.json'))
  manifest['metadata'] = 'metadata.json'
}

writeFileSync(join(destDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log('manifest.json written:', manifest)
