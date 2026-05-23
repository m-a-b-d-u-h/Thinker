"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Trash2 } from "lucide-react";

export interface NodeForm {
  id: string;
  positionX: number;
  positionY: number;
  label: string;
  type: string;
}

export interface EdgeForm {
  id: string;
  source: string;
  target: string;
  label: string;
  animated: boolean;
}

interface Props {
  nodes: NodeForm[];
  edges: EdgeForm[];
  onNodesChange: (nodes: NodeForm[]) => void;
  onEdgesChange: (edges: EdgeForm[]) => void;
  slug: string;
}

function toFlowNode(n: NodeForm): Node {
  return {
    id: n.id,
    position: { x: n.positionX, y: n.positionY },
    data: { label: n.label },
    type: "editor",
  };
}

function toFlowEdge(e: EdgeForm): Edge {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated,
    style: { stroke: "rgba(255,255,255,0.45)", strokeWidth: 2.5 },
  };
}

const EditorNode = ({ data, selected }: NodeProps) => (
  <div
    className={`bg-[#0d0d0d]/90 border rounded-lg px-3 py-2 text-[10px] font-bold text-center whitespace-nowrap backdrop-blur-sm shadow-lg shadow-black/20 transition-all ${
      selected ? "border-white/50 ring-1 ring-white/20" : "border-[#333]"
    }`}
  >
    <Handle type="target" position={Position.Top} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
    {data.label as string}
    <Handle type="source" position={Position.Bottom} className="!bg-[#555] !border-0 !w-1.5 !h-1.5" />
  </div>
);

const nodeTypes = { editor: EditorNode };

function Flow({ nodes: parentNodes, edges: parentEdges, onNodesChange: notifyNodes, onEdgesChange: notifyEdges, slug }: Props) {
  const rfNodes = useMemo(() => parentNodes.map(toFlowNode), [parentNodes]);
  const rfEdges = useMemo(() => parentEdges.map(toFlowEdge), [parentEdges]);

  const [nodes, setNodes] = useState(rfNodes);
  const [edges, setEdges] = useState(rfEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const syncNodes = useCallback((updated: Node[]) => {
    notifyNodes(
      updated.map((n) => ({
        id: n.id,
        positionX: n.position.x,
        positionY: n.position.y,
        label: (n.data?.label as string) || "",
        type: "custom",
      }))
    );
  }, [notifyNodes]);

  const syncEdges = useCallback((updated: Edge[]) => {
    notifyEdges(
      updated.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === "string" ? e.label : "",
        animated: e.animated ?? true,
      }))
    );
  }, [notifyEdges]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const next = applyNodeChanges(changes, nodesRef.current);
      setNodes(next);
      syncNodes(next);
    },
    [syncNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const next = applyEdgeChanges(changes, edgesRef.current);
      setEdges(next);
      syncEdges(next);
    },
    [syncEdges]
  );

  const handleConnect: OnConnect = useCallback(
    (conn) => {
      const id = `edge-${conn.source}-${conn.target}-${Date.now()}`;
      const newEdge: Edge = { ...conn, id, animated: true, style: { stroke: "rgba(255,255,255,0.45)", strokeWidth: 2.5 } };
      const next = [...edgesRef.current, newEdge];
      setEdges(next);
      syncEdges(next);
    },
    [syncEdges]
  );

  const handleSelectionChange = useCallback(({ nodes: selNodes }: { nodes: Node[] }) => {
    setSelectedId(selNodes.length === 1 ? selNodes[0].id : null);
  }, []);

  const addNewNode = useCallback(() => {
    const id = `${slug}-${Date.now()}`;
    const x = 150 + Math.random() * 300;
    const y = 150 + Math.random() * 200;
    const newNode: Node = { id, position: { x, y }, data: { label: "New Node" }, type: "editor" };
    const next = [...nodesRef.current, newNode];
    setNodes(next);
    syncNodes(next);
  }, [slug, syncNodes]);

  const deleteNode = useCallback(() => {
    if (!selectedId) return;
    const nodeNext = nodesRef.current.filter((n) => n.id !== selectedId);
    const edgeNext = edgesRef.current.filter((e) => e.source !== selectedId && e.target !== selectedId);
    setNodes(nodeNext);
    setEdges(edgeNext);
    syncNodes(nodeNext);
    syncEdges(edgeNext);
    setSelectedId(null);
  }, [selectedId, syncNodes, syncEdges]);

  const updateNodeLabel = useCallback((id: string, label: string) => {
    const next = nodesRef.current.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, label } } : n
    );
    setNodes(next);
    syncNodes(next);
  }, [syncNodes]);

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={addNewNode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/15 transition-all"
        >
          <Plus size={13} /> Add Node
        </button>
        {selectedId && (
          <button
            onClick={deleteNode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
        <span className="text-xs text-white/20 ml-auto">
          {nodes.length} node{nodes.length !== 1 ? "s" : ""}, {edges.length} edge{edges.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="h-[400px] bg-[#050505] rounded-2xl overflow-hidden border border-white/[0.06]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onSelectionChange={handleSelectionChange}
          nodeTypes={nodeTypes}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.3, duration: 200 }}
          minZoom={0.2}
          maxZoom={3}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          deleteKeyCode={["Backspace", "Delete"]}
          onNodesDelete={(deleted) => {
            const deletedIds = new Set(deleted.map((n) => n.id));
            const nodeNext = nodesRef.current.filter((n) => !deletedIds.has(n.id));
            const edgeNext = edgesRef.current.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target));
            setNodes(nodeNext);
            setEdges(edgeNext);
            syncNodes(nodeNext);
            syncEdges(edgeNext);
            setSelectedId(null);
          }}
          onEdgesDelete={(deleted) => {
            const deletedIds = new Set(deleted.map((e) => e.id));
            const edgeNext = edgesRef.current.filter((e) => !deletedIds.has(e.id));
            setEdges(edgeNext);
            syncEdges(edgeNext);
          }}
        >
          <Background color="#ffffff06" gap={20} size={0.5} />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Node Properties</span>
            <span className="text-[10px] font-mono text-white/20">{selectedNode.id}</span>
          </div>
          <input
            value={selectedNode.data?.label as string || ""}
            onChange={(e) => updateNodeLabel(selectedNode.id, e.target.value)}
            placeholder="Node label"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20"
          />
          <div className="flex gap-4 text-xs text-white/30">
            <span>X: {Math.round(selectedNode.position.x)}</span>
            <span>Y: {Math.round(selectedNode.position.y)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModuleGraphEditor(props: Props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
