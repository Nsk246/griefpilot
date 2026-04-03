import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function Constellation({ nodes }) {
  const svgRef = useRef(null)
  const simRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return
    const el = svgRef.current
    const W = el.clientWidth || 340
    const H = el.clientHeight || 340

    const svg = d3.select(el)
    svg.selectAll('*').remove()

    if (!nodes || nodes.length === 0) {
      svg.append('text')
        .attr('x', W / 2).attr('y', H / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#252540')
        .attr('font-size', 13)
        .attr('font-family', 'Inter, sans-serif')
        .text('memories will appear here')
      return
    }

    // Build edges between same-emotion nodes
    const links = []
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].emotion === nodes[j].emotion) {
          links.push({ source: nodes[i].id, target: nodes[j].id })
        }
      }
    }

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.3))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide().radius(d => d.weight * 6 + 12))

    simRef.current = sim

    const linkEl = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#252540')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.5)

    const nodeG = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'default')

    nodeG.append('circle')
      .attr('r', d => d.weight * 5 + 4)
      .attr('fill', d => d.color + '33')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1)

    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.weight * 5 + 16)
      .attr('fill', '#9b93ea')
      .attr('font-size', 10)
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.text.length > 20 ? d.text.slice(0, 18) + '…' : d.text)

    sim.on('tick', () => {
      linkEl
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      nodeG.attr('transform', d =>
        `translate(${Math.max(20, Math.min(W - 20, d.x))},${Math.max(20, Math.min(H - 20, d.y))})`
      )
    })

    return () => sim.stop()
  }, [nodes])

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: 260 }}
    />
  )
}