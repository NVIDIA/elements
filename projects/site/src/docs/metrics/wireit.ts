import ForceGraph3D from '3d-force-graph';
import type { WireitGraph, WireitGraphNode } from '@internals/metadata';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/divider/define.js';

const rawData = (globalThis as unknown as { wireitData: WireitGraph }).wireitData;

const colorScale = {
  root: '#5dafee',
  elements: '#46a458',
  labs: '#8e4ec6',
  internals: '#e5484d',
  starters: '#f66807',
  themes: '#ffc801',
  styles: '#ffc801',
  testing: '#79c0ff',
  site: '#82ccd9',
  other: '#8b949e'
};

type LinkType = {
  source?: string | number | Record<string, unknown>;
  target?: string | number | Record<string, unknown>;
};

const allNodes = [...rawData.nodes];
const allLinks = [...rawData.links];
let visibleNodeIds = new Set(allNodes.map(n => n.id));
let showCongestion = true;
let hoveredNode: WireitGraphNode | null = null;
let currentFilteredNodes = [...allNodes];
let currentFilteredLinks = [...allLinks];

const congestionStats = calculateCongestionStats();

function calculateCongestionStats() {
  const congestionScores = allLinks.map(link => {
    const sourceNode =
      typeof link.source === 'object' ? (link.source as WireitGraphNode) : allNodes.find(n => n.id === link.source);
    const targetNode =
      typeof link.target === 'object' ? (link.target as WireitGraphNode) : allNodes.find(n => n.id === link.target);

    const sourceCongestion = sourceNode ? sourceNode.dependencies + sourceNode.dependents : 0;
    const targetCongestion = targetNode ? targetNode.dependencies + targetNode.dependents : 0;

    return sourceCongestion + targetCongestion;
  });

  return {
    min: Math.min(...congestionScores),
    max: Math.max(...congestionScores)
  };
}

function getNodeSize(node: WireitGraphNode) {
  return Math.sqrt(node.dependents) * 3;
}

function interpolateColor(color1: [number, number, number], color2: [number, number, number], factor: number) {
  const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

function getCongestionColor(congestion: number) {
  const normalized =
    congestionStats.max > congestionStats.min
      ? (congestion - congestionStats.min) / (congestionStats.max - congestionStats.min)
      : 0;

  const green: [number, number, number] = [34, 197, 94];
  const yellow: [number, number, number] = [234, 179, 8];
  const orange: [number, number, number] = [249, 115, 22];
  const red: [number, number, number] = [239, 68, 68];

  if (normalized < 0.33) {
    return interpolateColor(green, yellow, normalized / 0.33);
  } else if (normalized < 0.66) {
    return interpolateColor(yellow, orange, (normalized - 0.33) / 0.33);
  } else {
    return interpolateColor(orange, red, (normalized - 0.66) / 0.34);
  }
}

function getLinkCongestion(link: LinkType) {
  if (!link.source || !link.target) return 0;

  const sourceNode =
    typeof link.source === 'object'
      ? (link.source as unknown as WireitGraphNode)
      : allNodes.find(n => n.id === link.source);
  const targetNode =
    typeof link.target === 'object'
      ? (link.target as unknown as WireitGraphNode)
      : allNodes.find(n => n.id === link.target);
  const sourceCongestion = sourceNode ? sourceNode.dependencies + sourceNode.dependents : 0;
  const targetCongestion = targetNode ? targetNode.dependencies + targetNode.dependents : 0;

  return sourceCongestion + targetCongestion;
}

function getLinkColor(link: LinkType) {
  if (hoveredNode && !isLinkConnectedToNode(link, hoveredNode)) {
    return 'rgba(48, 54, 61, 0.02)';
  }

  if (showCongestion) {
    const congestion = getLinkCongestion(link);
    return getCongestionColor(congestion);
  }
  return '#bbbfce';
}

function isLinkConnectedToNode(link: LinkType, node: WireitGraphNode | null) {
  if (!node || !link.source || !link.target) return false;

  const sourceId = typeof link.source === 'object' ? (link.source as unknown as WireitGraphNode).id : link.source;
  const targetId = typeof link.target === 'object' ? (link.target as unknown as WireitGraphNode).id : link.target;

  return sourceId === node.id || targetId === node.id;
}

function isNodeConnected(node: WireitGraphNode, hovered: WireitGraphNode | null) {
  if (!hovered || node.id === hovered.id) return true;

  return currentFilteredLinks.some(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as WireitGraphNode).id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as WireitGraphNode).id : link.target;
    return (sourceId === node.id && targetId === hovered.id) || (targetId === node.id && sourceId === hovered.id);
  });
}

function getNodeColor(node: WireitGraphNode) {
  const baseColor = colorScale[node.category as keyof typeof colorScale] || colorScale.other;
  return hoveredNode && !isNodeConnected(node, hoveredNode) ? baseColor + '20' : baseColor;
}

function updateStats(visible: number) {
  const statScripts = globalThis.document.getElementById('stat-scripts');
  const statLinks = globalThis.document.getElementById('stat-links');
  const statVisible = globalThis.document.getElementById('stat-visible');

  if (statScripts) {
    statScripts.textContent = String(allNodes.length);
  }
  if (statLinks) {
    statLinks.textContent = String(allLinks.length);
  }
  if (statVisible) {
    statVisible.textContent = String(visible);
  }
}

const graphElement = globalThis.document.querySelector('#graph') as HTMLElement;
const { width, height } = graphElement.getBoundingClientRect();

const Graph = new ForceGraph3D(graphElement)
  .graphData({ nodes: allNodes, links: allLinks })
  .backgroundColor('#0a0c10')
  .nodeLabel(node => {
    const n = node as WireitGraphNode;
    return `<p nve-text="body sm">Package: ${n.packageName}<br />Script: ${n.scriptName}<br />Dependencies: ${n.dependencies}<br />Dependents: ${n.dependents}<br />Category: ${n.category}</p>`;
  })
  .nodeVal(node => getNodeSize(node as WireitGraphNode))
  .nodeColor(node => getNodeColor(node as WireitGraphNode))
  .nodeOpacity(0.9)
  .linkColor(link => getLinkColor(link as LinkType))
  .linkOpacity(0.5)
  .linkWidth(0.5)
  .linkDirectionalParticles(1)
  .linkDirectionalParticleWidth(1)
  .linkDirectionalParticleColor('#ccc')
  .linkDirectionalParticleSpeed(0.002)
  .d3AlphaDecay(0.02)
  .d3VelocityDecay(0.3)
  .width(width)
  .height(height)
  .cameraPosition({ x: 800, y: 0, z: 0 })
  .onNodeClick(node => {
    const distRatio = 1 + 150 / Math.hypot(node.x!, node.y!, node.z!);
    Graph.cameraPosition(
      { x: node.x! * distRatio, y: node.y! * distRatio, z: node.z! * distRatio },
      node as unknown as { x: number; y: number; z: number },
      1000
    );
  })
  .onNodeDragEnd(node => {
    node.fx = node.x;
    node.fy = node.y;
    node.fz = node.z;
  })
  .onNodeHover(node => {
    hoveredNode = node as WireitGraphNode | null;
    Graph.linkColor(link => getLinkColor(link as LinkType)).nodeColor(n => getNodeColor(n as WireitGraphNode));
  });

const searchInput = globalThis.document.getElementById('search') as HTMLInputElement;
searchInput?.addEventListener('input', function () {
  const query = this.value.toLowerCase();

  if (!query) {
    visibleNodeIds = new Set(allNodes.map(n => n.id));
    currentFilteredNodes = [...allNodes];
    currentFilteredLinks = [...allLinks];
    Graph.graphData({ nodes: currentFilteredNodes, links: currentFilteredLinks });
    updateStats(allNodes.length);
    return;
  }

  const filteredNodes = allNodes.filter(
    node =>
      node.label.toLowerCase().includes(query) ||
      node.packageName.toLowerCase().includes(query) ||
      node.scriptName.toLowerCase().includes(query)
  );

  visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredLinks = allLinks.filter(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as WireitGraphNode).id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as WireitGraphNode).id : link.target;
    return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
  });

  currentFilteredNodes = filteredNodes;
  currentFilteredLinks = filteredLinks;
  Graph.graphData({ nodes: currentFilteredNodes, links: currentFilteredLinks });
  updateStats(filteredNodes.length);
});

globalThis.document.getElementById('show-congestion')?.addEventListener('change', function (this: HTMLInputElement) {
  showCongestion = this.checked;
  Graph.linkColor(link => getLinkColor(link as LinkType));
});

updateStats(allNodes.length);
