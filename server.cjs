const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.API_PORT || 3001
const DATA_FILE = path.join(__dirname, 'collections-data.json')

app.use(express.json({ limit: '50mb' }))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Collections API running on port ${PORT}`)
})
