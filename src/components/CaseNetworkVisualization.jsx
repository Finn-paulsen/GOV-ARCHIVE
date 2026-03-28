/**
 * CaseNetworkVisualization Component
 * D3-basierte Netzwerk-Visualisierung für verknüpfte Fälle
 */

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './CaseNetworkVisualization.css';

export default function CaseNetworkVisualization({ cases = [], containerHeight = 500 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!cases || cases.length === 0) return;

    // Erstelle Knoten aus Fällen
    const nodes = cases.map((c, i) => ({
      id: c.id,
      label: c.id,
      title: c.title,
      priority: c.priority,
      status: c.status,
      persons: c.persons,
      location: c.location?.name || 'Unknown'
    }));

    // Erstelle Links basierend auf Ähnlichkeiten (Person-Count, Location)
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        
        // Link wenn: gleiche Location ODER ähnliche Personenanzahl
        let strength = 0;
        if (n1.location === n2.location) {
          strength = 0.8;
        }
        if (Math.abs(n1.persons - n2.persons) <= 3) {
          strength = Math.max(strength, 0.5);
        }
        
        if (strength > 0) {
          links.push({
            source: n1.id,
            target: n2.id,
            strength: strength
          });
        }
      }
    }

    // D3 Setup
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = svgRef.current?.parentElement?.clientWidth || 800;
    const height = containerHeight;

    // Leere SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => 100 / d.strength)
        .strength(d => d.strength * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => 40));

    // Links zeichnen
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        const opacity = d.strength * 0.6;
        return `rgba(0, 255, 0, ${opacity})`;
      })
      .attr('stroke-width', d => d.strength * 3)
      .attr('class', 'case-link');

    // Nodes zeichnen
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'case-node')
      .call(drag(simulation));

    // Circle für Node
    node.append('circle')
      .attr('r', d => {
        switch (d.priority) {
          case 'critical': return 20;
          case 'high': return 16;
          case 'medium': return 12;
          default: return 8;
        }
      })
      .attr('fill', d => {
        switch (d.priority) {
          case 'critical': return '#ff0000';
          case 'high': return '#ff9900';
          case 'medium': return '#ffff00';
          default: return '#00ff00';
        }
      })
      .attr('stroke', '#00ff00')
      .attr('stroke-width', 2)
      .attr('class', d => `node-${d.status}`);

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#000')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none');

    // Tooltips
    node.append('title')
      .text(d => `
${d.title}
Fälle-ID: ${d.id}
Status: ${d.status}
Priorität: ${d.priority}
Personen: ${d.persons}
Standort: ${d.location}
      `);

    // Update Positionen
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const sourceNode = nodes.find(n => n.id === d.source);
          return sourceNode.x;
        })
        .attr('y1', d => {
          const sourceNode = nodes.find(n => n.id === d.source);
          return sourceNode.y;
        })
        .attr('x2', d => {
          const targetNode = nodes.find(n => n.id === d.target);
          return targetNode.x;
        })
        .attr('y2', d => {
          const targetNode = nodes.find(n => n.id === d.target);
          return targetNode.y;
        });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag Funktion
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

  }, [cases, containerHeight]);

  return (
    <div className="case-network-container">
      <div className="network-header">
        <h3>Fallnetzwerk-Analyse</h3>
        <p className="network-info">
          {cases.length} Fälle angezeigt • Größe = Priorität • Linien = Verbindungen
        </p>
      </div>
      <svg ref={svgRef} className="case-network-svg"></svg>
      <div className="network-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff0000' }}></span>
          <span>Kritisch</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff9900' }}></span>
          <span>Hoch</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffff00' }}></span>
          <span>Mittel</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00ff00' }}></span>
          <span>Niedrig</span>
        </div>
      </div>
    </div>
  );
}
