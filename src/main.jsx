import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
// Import external hacker theme (cloned from external/Network)
import '../external/Network/static/css/style.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
