import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import staticNetwork from '../data/network.json'
import { generateDemoNetwork } from '../utils/networkDemo'

export default function NetworkGraph(){
  const ref = useRef(null)
  const [data, setData] = useState(staticNetwork)
  const [mode, setMode] = useState('static') // 'static' or 'demo'

  useEffect(()=>{
    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()
    const width = 800
    const height = 420

    svg.attr('viewBox', [0,0,width,height])

    const link = svg.append('g')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke-width', d=>Math.sqrt(d.value))

    const node = svg.append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter().append('circle')
      .attr('r', d=> d.size || 6)
      .attr('fill', d=> d.group===1? '#55ffaa':'#77ffdd')
      .call(drag(simulation))

    const label = svg.append('g')
      .selectAll('text')
      .data(data.nodes)
      .enter().append('text')
      .text(d=>d.id)
      .attr('font-size',10)
      .attr('fill','rgba(255,255,255,0.6)')

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d=>d.id).distance(80).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-160))
      .force('center', d3.forceCenter(width/2, height/2))
      .on('tick', ticked)

    function ticked(){
      link
        .attr('x1', d=>d.source.x)
        .attr('y1', d=>d.source.y)
        .attr('x2', d=>d.target.x)
        .attr('y2', d=>d.target.y)

      node
        .attr('cx', d=>d.x)
        .attr('cy', d=>d.y)

      label
        .attr('x', d=>d.x + 8)
        .attr('y', d=>d.y + 4)
    }

    function drag(sim){
      function dragstarted(event){
        if (!event.active) sim.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }
      function dragged(event){
        event.subject.fx = event.x
        event.subject.fy = event.y
      }
      function dragended(event){
        if (!event.active) sim.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    return ()=> simulation.stop()
  },[data])

  function useDemo(){
    const demo = generateDemoNetwork('192.168.1.0/24')
    setData(demo)
    setMode('demo')
  }

  function useStatic(){
    setData(staticNetwork)
    setMode('static')
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
        <h3 style={{margin:0}}>Netzwerk</h3>
        <div style={{marginLeft:12}}>
          <button onClick={useStatic} disabled={mode==='static'}>Static</button>
          <button onClick={useDemo} disabled={mode==='demo'} style={{marginLeft:6}}>Demo</button>
        </div>
      </div>
      <svg ref={ref} style={{width:'100%',height:420,background:'linear-gradient(180deg,#001018,#001220)'}}></svg>
    </div>
  )
}
