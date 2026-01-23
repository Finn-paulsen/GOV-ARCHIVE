// Lightweight JS port of the fallback/demo generators from external/Network/network_utils.py
// Exposes generateDemoNetwork(target) which returns { nodes: [], links: [] }

function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min }

export function generateFallbackResults(target){
  // returns an array of hosts: { ip, hostname, status }
  const results = []
  let networkPart = '192.168.1'
  if(target && target.includes('/')){
    try{
      const base = target.split('/')[0]
      networkPart = base.split('.').slice(0,3).join('.')
    }catch(e){}
  } else if(target && target.includes('.')){
    try{ networkPart = target.split('.').slice(0,3).join('.') }catch(e){}
  }

  const numHosts = randInt(3,5)
  const hostnames = ['host','device','laptop','desktop']
  for(let i=0;i<numHosts;i++){
    const hostPart = randInt(2,250)
    const ip = `${networkPart}.${hostPart}`
    results.push({
      ip,
      hostname: `${hostnames[randInt(0,hostnames.length-1)]}-${hostPart}`,
      status: 'up'
    })
  }
  return results
}

export function generateFallbackHostDetails(ip){
  const services = [21,22,23,25,53,80,443,445,3389,8080]
  const numPorts = randInt(2,5)
  const picked = []
  while(picked.length < numPorts){
    const p = services[randInt(0,services.length-1)]
    if(!picked.includes(p)) picked.push(p)
  }
  const ports = picked.map(p=>({port:p,service:getServiceName(p),status:'open'}))
  return {
    ip,
    hostname: `host-${ip.split('.').pop()}`,
    ports,
    os_guess: ['Windows','Linux/Unix','Unknown'][randInt(0,2)]
  }
}

function getServiceName(port){
  const map = {21:'FTP',22:'SSH',23:'Telnet',25:'SMTP',53:'DNS',80:'HTTP',443:'HTTPS',445:'SMB',3389:'RDP',8080:'HTTP-Proxy'}
  return map[port] || 'Unknown'
}

export function generateDemoNetwork(target){
  const hosts = generateFallbackResults(target)
  // create nodes array
  const nodes = hosts.map((h,i)=>({ id: h.hostname || h.ip, ip: h.ip, group: i%2?1:2, size: randInt(5,12) }))
  // create some links randomly
  const links = []
  for(let i=0;i<nodes.length;i++){
    const targets = []
    const num = randInt(1, Math.max(1, Math.min(2,nodes.length-1)))
    while(targets.length < num){
      const t = randInt(0,nodes.length-1)
      if(t !== i && !targets.includes(t)) targets.push(t)
    }
    targets.forEach(t=> links.push({ source: nodes[i].id, target: nodes[t].id, value: randInt(1,4) }))
  }
  return { nodes, links }
}

export default { generateDemoNetwork, generateFallbackResults, generateFallbackHostDetails }
