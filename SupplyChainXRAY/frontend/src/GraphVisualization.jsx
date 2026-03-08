import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TIER_COLORS = {
  1: '#ffaa00',   // Tier 1 Pharma — amber
  2: '#0066ff',   // Tier 2 Manufacturing — blue
  3: '#7c3aed',   // Tier 3 Raw materials — violet
};

const TIER_GLOW = {
  1: 'rgba(255,170,0,0.7)',
  2: 'rgba(0,102,255,0.7)',
  3: 'rgba(124,58,237,0.7)',
};

export default function GraphVisualization({ graphData, selectedNode, criticalNodes, onNodeClick }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graphData?.nodes?.length) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 520;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', [0, 0, width, height]);

    const criticalSet = new Set((criticalNodes || []).map(n => n.supplier_id));

    /* ── Defs ── */
    const defs = svg.append('defs');

    // Glow filters
    const createGlow = (id, color, stdDev = 3) => {
      const f = defs.append('filter').attr('id', id).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      f.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', stdDev).attr('result', 'blur');
      const merge = f.append('feMerge');
      merge.append('feMergeNode').attr('in', 'blur');
      merge.append('feMergeNode').attr('in', 'SourceGraphic');
    };
    createGlow('glow-amber', '#ffaa00', 4);
    createGlow('glow-blue', '#0066ff', 4);
    createGlow('glow-violet', '#7c3aed', 4);
    createGlow('glow-red', '#ff3355', 6);
    createGlow('glow-cyan', '#00d4ff', 8);

    // Edge gradient
    const edgeGrad = defs.append('linearGradient').attr('id', 'edgeGrad').attr('gradientUnits', 'userSpaceOnUse');
    edgeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#0066ff').attr('stop-opacity', 0.1);
    edgeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#00d4ff').attr('stop-opacity', 0.4);

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 16).attr('refY', 0)
      .attr('markerWidth', 4).attr('markerHeight', 4)
      .attr('orient', 'auto')
      .append('path').attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(0,212,255,0.35)');

    const g = svg.append('g');

    // Zoom
    svg.call(
      d3.zoom()
        .scaleExtent([0.15, 5])
        .on('zoom', e => g.attr('transform', e.transform))
    );

    // Background scanlines
    svg.append('rect').attr('width', '100%').attr('height', '100%')
      .attr('fill', 'url(#scanPattern)')
      .style('pointer-events', 'none').attr('opacity', 0.04);

    defs.append('pattern').attr('id', 'scanPattern')
      .attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 4).attr('patternUnits', 'userSpaceOnUse')
      .append('line').attr('x1', 0).attr('y1', 0).attr('x2', 100).attr('y2', 0)
      .attr('stroke', '#00d4ff').attr('stroke-width', 0.5);

    /* ── Force Sim ── */
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(90).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(22));

    /* ── Links ── */
    const link = g.append('g').selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', 'url(#edgeGrad)')
      .attr('stroke-width', d => Math.max(0.5, d.weight * 1.8))
      .attr('stroke-opacity', 0.5)
      .attr('marker-end', 'url(#arrowhead)');

    /* ── Nodes ── */
    const nodeGroup = g.append('g').selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (e, d) => { e.stopPropagation(); onNodeClick && onNodeClick(d); });

    // Outer ring for critical/selected
    nodeGroup.each(function(d) {
      const g = d3.select(this);
      const isCritical = criticalSet.has(d.id);
      const isSelected = d.id === selectedNode;

      if (isSelected || isCritical) {
        // Animated outer ring
        g.append('circle')
          .attr('r', 18)
          .attr('fill', 'none')
          .attr('stroke', isSelected ? '#00d4ff' : '#ff3355')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4 3')
          .attr('opacity', 0.7)
          .style('animation', `spin ${isSelected ? '4s' : '6s'} linear infinite`);
      }
    });

    // Main circle
    nodeGroup.append('circle')
      .attr('r', d => {
        if (d.id === selectedNode) return 14;
        if (criticalSet.has(d.id)) return 12;
        return 7 + Math.sqrt((d.pagerank || 0) * 1000);
      })
      .attr('fill', d => TIER_COLORS[d.tier] || '#64748b')
      .attr('fill-opacity', 0.9)
      .attr('stroke', d => {
        if (d.id === selectedNode) return '#00d4ff';
        if (criticalSet.has(d.id)) return '#ff3355';
        return 'rgba(255,255,255,0.15)';
      })
      .attr('stroke-width', d => (d.id === selectedNode || criticalSet.has(d.id)) ? 2 : 0.5)
      .attr('filter', d => {
        if (d.id === selectedNode) return 'url(#glow-cyan)';
        if (criticalSet.has(d.id)) return 'url(#glow-red)';
        const t = d.tier;
        return t === 1 ? 'url(#glow-amber)' : t === 2 ? 'url(#glow-blue)' : 'url(#glow-violet)';
      });

    // Label
    nodeGroup.append('text')
      .text(d => d.id.replace('SUP_', 'S'))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '6.5px')
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('pointer-events', 'none');

    /* ── Tooltip ── */
    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(3,8,18,0.95)')
      .style('border', '1px solid rgba(0,212,255,0.3)')
      .style('border-radius', '12px')
      .style('padding', '12px 16px')
      .style('font-size', '12px')
      .style('font-family', 'Inter, sans-serif')
      .style('color', '#e8f4ff')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 9999)
      .style('box-shadow', '0 0 20px rgba(0,212,255,0.2), 0 16px 40px rgba(0,0,0,0.6)')
      .style('backdrop-filter', 'blur(12px)')
      .style('min-width', '200px');

    nodeGroup
      .on('mouseover', (e, d) => {
        tooltip.transition().duration(150).style('opacity', 1);
        const isCrit = criticalSet.has(d.id);
        tooltip.html(`
          <div style="font-weight:800;font-size:13px;margin-bottom:8px;color:${TIER_COLORS[d.tier] || '#fff'}">${d.id}</div>
          <div style="display:grid;gap:4px;font-size:11px;">
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span style="color:#6b8caa">Country</span>
              <span style="font-weight:600">${d.country}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span style="color:#6b8caa">Tier</span>
              <span style="font-weight:600">Tier ${d.tier}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span style="color:#6b8caa">Product</span>
              <span style="font-weight:600;font-size:10px">${d.product_type || '—'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px">
              <span style="color:#6b8caa">PageRank</span>
              <span style="font-weight:600;font-family:monospace">${((d.pagerank || 0) * 100).toFixed(3)}</span>
            </div>
            ${isCrit ? `<div style="margin-top:6px;padding:4px 8px;background:rgba(255,51,85,0.1);border-radius:6px;color:#ff3355;font-weight:700;font-size:10px;text-align:center">⚠ SYSTEMIC RISK NODE</div>` : ''}
          </div>
        `)
        .style('left', (e.pageX + 14) + 'px')
        .style('top', (e.pageY - 20) + 'px');
      })
      .on('mousemove', e => tooltip.style('left', (e.pageX + 14) + 'px').style('top', (e.pageY - 20) + 'px'))
      .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [graphData, selectedNode, criticalNodes]);

  return (
    <div className="graph-container scanlines">
      <div className="graph-header">
        <div>
          <div className="card-title" style={{ marginBottom: 10 }}>
            <span className="card-title-icon">🕸</span> Supply Chain Network
          </div>
          <div className="legend">
            {[
              { color: '#ffaa00', glow:'rgba(255,170,0,0.6)', label: 'Tier 1 · Pharma' },
              { color: '#0066ff', glow:'rgba(0,102,255,0.6)', label: 'Tier 2 · Mfg' },
              { color: '#7c3aed', glow:'rgba(124,58,237,0.6)', label: 'Tier 3 · Raw' },
              { color: '#ff3355', glow:'rgba(255,51,85,0.6)', label: 'Critical Node' },
              { color: '#00d4ff', glow:'rgba(0,212,255,0.6)', label: 'Selected' },
            ].map(l => (
              <div key={l.label} className="legend-item">
                <div className="legend-dot" style={{ background: l.color, boxShadow: `0 0 6px ${l.glow}` }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--t-muted)', fontFamily: 'var(--font-mono)', textAlign: 'right', lineHeight: 1.7 }}>
          scroll · zoom · drag<br />click to select
        </div>
      </div>
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}
