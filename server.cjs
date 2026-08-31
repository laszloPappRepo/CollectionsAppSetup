const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.API_PORT || process.env.PORT || 8443
const HOST = process.env.HOST || '0.0.0.0'
const DATA_FILE = path.join(__dirname, 'collections-data.json')
const STORAGE_DIR = path.join(__dirname, 'collections-data')
const META_FILE = path.join(STORAGE_DIR, 'metadata.json')
const ITEMS_DIR = path.join(STORAGE_DIR, 'items')

app.use(express.json({ limit: '100mb' }))

// The development UI runs on :8443 while this local-only data service runs
// on :8444. Allow that browser origin without exposing the service remotely.
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin === 'http://localhost:8443' || origin === 'http://127.0.0.1:8443') {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// Serve built frontend
app.use(express.static(path.join(__dirname, 'dist')))

function loadData() {
  try {
    if (fs.existsSync(META_FILE)) {
      const metadata = JSON.parse(fs.readFileSync(META_FILE, 'utf8'))
      const items = fs.existsSync(ITEMS_DIR)
        ? fs.readdirSync(ITEMS_DIR).filter((name) => name.endsWith('.json'))
            .map((name) => JSON.parse(fs.readFileSync(path.join(ITEMS_DIR, name), 'utf8')))
        : []
      return normalizeData({ types: metadata.types || [], folders: metadata.folders || [], items })
    }
    if (!fs.existsSync(DATA_FILE)) return { types: [], folders: [], items: [] }
    return normalizeData(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')))
  }
  catch { return { types: [], folders: [], items: [] } }
}

// Older exports contain item files whose folder records were not included in
// metadata.json. Keep those items usable instead of silently orphaning them.
function normalizeData(data) {
  const types = Array.isArray(data.types) ? [...data.types] : []
  const folders = Array.isArray(data.folders) ? [...data.folders] : []
  const items = Array.isArray(data.items) ? data.items : []
  const knownFolderIds = new Set(folders.map((folder) => folder.id))
  const missingFolderIds = [...new Set(items
    .map((item) => item.folderId)
    .filter((folderId) => typeof folderId === 'string' && !knownFolderIds.has(folderId)))]

  if (missingFolderIds.length === 0) return { types, folders, items }

  const importedTypeId = 'imported-collections'
  if (!types.some((type) => type.id === importedTypeId)) {
    types.push({ id: importedTypeId, label: 'Imported collections', icon: '📦' })
  }
  for (const folderId of missingFolderIds) {
    folders.push({
      id: folderId,
      name: `Imported folder ${folderId}`,
      typeId: importedTypeId,
      parentId: null,
    })
  }
  return { types, folders, items }
}

const GDRIVE_BACKUP = process.env.GDRIVE_PATH ||
  'C:\\Users\\gemini20\\Google Drive\\MyDrive\\CollectionsApp'

function saveData(data) {
  saveMetadata(data.types || [], data.folders || [])
  for (const item of data.items || []) saveItem(item)
}

function itemPath(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid item id')
  return path.join(ITEMS_DIR, `${id}.json`)
}

function saveItem(item) {
  fs.mkdirSync(ITEMS_DIR, { recursive: true })
  fs.writeFileSync(itemPath(item.id), JSON.stringify(item, null, 2), 'utf8')
}

function saveMetadata(types, folders) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
  fs.writeFileSync(META_FILE, JSON.stringify({ types, folders }, null, 2), 'utf8')
}

let backupTimer = null
function scheduleGDriveBackup() {
  if (backupTimer) clearTimeout(backupTimer)
  backupTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(GDRIVE_BACKUP)) fs.mkdirSync(GDRIVE_BACKUP, { recursive: true })
      const dest = path.join(GDRIVE_BACKUP, 'collections-data')
      fs.cpSync(STORAGE_DIR, dest, { recursive: true })
      console.log('[backup] copied to Google Drive')
    } catch (e) {
      console.error('[backup] Google Drive copy failed:', e.message)
    }
  }, 5000)
}

app.get('/api/data', (req, res) => {
  const data = loadData()
  if (req.query.summary === '1') {
    return res.json({ ...data, items: data.items.map(({ cover, ...item }) => item) })
  }
  res.json(data)
})

app.post('/api/data', (req, res) => {
  try {
    saveData(req.body)
    scheduleGDriveBackup()
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/meta', (req, res) => {
  try { saveMetadata(req.body.types || [], req.body.folders || []); scheduleGDriveBackup(); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/items/:id', (req, res) => {
  try {
    const file = itemPath(req.params.id)
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Item not found' })
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/items/:id', (req, res) => {
  try {
    const file = itemPath(req.params.id)
    const previous = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
    saveItem({ ...previous, ...req.body, id: req.params.id })
    scheduleGDriveBackup()
    res.json({ ok: true })
  }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/items/:id', (req, res) => {
  try {
    const file = itemPath(req.params.id)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    scheduleGDriveBackup()
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`Collections running on http://${HOST}:${PORT}`)
})
