const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 8443
const DATA_FILE = path.join(__dirname, 'collections-data.json')

app.use(express.json({ limit: '50mb' }))

// Serve built frontend
app.use(express.static(path.join(__dirname, 'dist')))

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { types: [], folders: [], items: [] }
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
  catch { return { types: [], folders: [], items: [] } }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

app.get('/api/data', (req, res) => {
  res.json(loadData())
})

app.post('/api/data', (req, res) => {
  try {
    saveData(req.body)
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Collections running on http://0.0.0.0:${PORT}`)
})
