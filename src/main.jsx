import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
// Import external hacker theme (cloned from external/Network)


const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
