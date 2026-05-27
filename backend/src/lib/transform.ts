export interface ReactFlowNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; description?: string };
  type?: string;
  style?: Record<string, string>;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export function transformNode(node: {
  id: string;
  positionX: number;
  positionY: number;
  label: string;
  description?: string | null;
  type?: string | null;
  style?: unknown;
}): ReactFlowNode {
  return {
    id: node.id,
    position: { x: node.positionX, y: node.positionY },
    data: { label: node.label, ...(node.description ? { description: node.description } : {}) },
    type: node.type || "custom",
    ...(node.style ? { style: node.style as Record<string, string> } : {}),
  };
}

export function transformEdge(edge: {
  id: string;
  source: string;
  target: string;
  label?: string | null;
  animated?: boolean | null;
}): ReactFlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    ...(edge.label ? { label: edge.label } : {}),
    animated: edge.animated ?? true,
  };
}
