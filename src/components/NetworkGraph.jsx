
import React, { useState } from 'react'
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer'
import staticNetwork from '../data/network.json'
import { generateDemoNetwork } from '../utils/networkDemo'


export default function NetworkGraph() {
  const [data, setData] = useState(staticNetwork)
  const [mode, setMode] = useState('static')

  // Hilfsfunktion: Netzwerkdaten in React-Flow-Format umwandeln
  function toFlowElements(network) {
    const nodes = network.nodes.map(n => ({
      id: n.id,
      data: { label: n.id },
      position: { x: Math.random() * 600 + 50, y: Math.random() * 300 + 50 },
      style: {
        background: n.group === 1 ? '#55ffaa' : '#77ffdd',
        color: '#001018',
        border: '2px solid #0ff',
        fontWeight: 700,
        fontSize: 12,
        width: 60,
        height: 30,
        borderRadius: 8,
      },
    }))
    const edges = network.links.map((l, i) => ({
      id: `e${l.source}-${l.target}`,
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      animated: true,
      style: { stroke: '#0ff', strokeWidth: 2, opacity: 0.2 },
      label: l.value ? String(l.value) : undefined,
    }))
    return [...nodes, ...edges]
  }

  function useDemo() {
    const demo = generateDemoNetwork('192.168.1.0/24')
    setData(demo)
    setMode('demo')
  }
  function useStatic() {
    setData(staticNetwork)
    setMode('static')
  }

  return (
    <div style={{ width: '100%', height: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Netzwerk</h3>
        <div style={{ marginLeft: 12 }}>
          <button onClick={useStatic} disabled={mode === 'static'}>Static</button>
          <button onClick={useDemo} disabled={mode === 'demo'} style={{ marginLeft: 6 }}>Demo</button>
        </div>
      </div>
      <div style={{ width: '100%', height: 420, background: 'linear-gradient(180deg,#001018,#001220)', borderRadius: 12, overflow: 'hidden' }}>
        <ReactFlow
          elements={toFlowElements(data)}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          zoomOnScroll={true}
          panOnScroll={true}
          minZoom={0.2}
          maxZoom={2}
        >
          <MiniMap nodeColor={n => n.style?.background || '#0ff'} />
          <Controls />
          <Background color="#0ff2" gap={16} />
        </ReactFlow>
      </div>
    </div>
  )
}
