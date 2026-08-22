// Run as Administrator: node install-service.cjs
// To uninstall:        node install-service.cjs --uninstall
const { Service } = require('node-windows')
const path = require('path')

const svc = new Service({
  name: 'Collections App',
  description: 'Personal media collections server (auto-starts on boot)',
  script: path.join(__dirname, 'server.cjs'),
  env: [{ name: 'PORT', value: '8443' }],
  // Keep alive automatically on crash
  wait: 2,
  grow: 0.5,
})

const uninstall = process.argv.includes('--uninstall')

svc.on('install', () => {
  console.log('Service installed. Starting...')
  svc.start()
})
svc.on('start', () => console.log('Collections service started on port 8443'))
svc.on('uninstall', () => console.log('Collections service uninstalled'))
svc.on('error', (err) => console.error('Service error:', err))

if (uninstall) {
  svc.uninstall()
} else {
  svc.install()
}
