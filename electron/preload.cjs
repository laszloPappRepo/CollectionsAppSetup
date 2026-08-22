// Preload runs in a sandboxed context before the renderer.
// Expose only what's needed — nothing here for now since the app
// uses localStorage which works natively in Electron's renderer.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronApp', {
  version: process.versions.electron,
})
