#!/usr/bin/env node
// Minimal local proxy to fetch pages and remove <script> tags.
// Usage: node scripts/proxy.mjs
// Listens on http://localhost:8787 and supports /fetch?url=<full-url>

import http from 'http'
import { URL } from 'url'

const PORT = process.env.PORT || 8787

function sanitize(html){
  // very small sanitization: remove <script>...</script> and on* attributes
  let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/on[a-z]+=\"[^"]*\"/gi, '')
  out = out.replace(/on[a-z]+=\'[^']*\'/gi, '')
  out = out.replace(/on[a-z]+=\w+/gi, '')
  return out
}

const server = http.createServer(async (req,res)=>{
  const u = new URL(req.url, `http://${req.headers.host}`)
  if(u.pathname === '/fetch'){
    const target = u.searchParams.get('url')
    if(!target){
      res.writeHead(400, {'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'})
      res.end('missing url param')
      return
    }
    try{
      const fetched = await fetch(target, {redirect:'follow'})
      const text = await fetched.text()
      const safe = sanitize(text)
      res.writeHead(200, {'Content-Type':'text/html','Access-Control-Allow-Origin':'*'})
      res.end(safe)
    }catch(e){
      res.writeHead(502, {'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'})
      res.end('fetch error: '+e.message)
    }
    return
  }
  res.writeHead(200, {'Content-Type':'text/plain','Access-Control-Allow-Origin':'*'})
  res.end('Local proxy running. Use /fetch?url=https://example.com')
})

server.listen(PORT, ()=>{
  console.log(`Local proxy listening on http://localhost:${PORT}`)
})
