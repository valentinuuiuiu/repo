declare module 'reactflow' {
  import React from 'react';

  export type Position = 'top' | 'right' | 'bottom' | 'left';
  export type HandleType = 'source' | 'target';
  export type MarkerType = string;

  export interface Node {
    id: string;
    type?: string;
    data: any;
    position: { x: number; y: number };
    style?: React.CSSProperties;
    className?: string;
    sourcePosition?: Position;
    targetPosition?: Position;
    hidden?: boolean;
    selected?: boolean;
    dragging?: boolean;
  }

  export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    labelStyle?: React.CSSProperties;
    labelShowBg?: boolean;
    labelBgStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    animated?: boolean;
    hidden?: boolean;
    markerStart?: MarkerType;
    markerEnd?: MarkerType;
    data?: any;
  }

  export interface NodeTypes {
    [key: string]: React.ComponentType<any>;
  }

  export interface EdgeTypes {
    [key: string]: React.ComponentType<any>;
  }

  export const Handle: React.FC<{
    type: HandleType;
    position: Position;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
  }>;

  export const ReactFlow: React.FC<{
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: (changes: any) => void;
    onEdgesChange?: (changes: any) => void;
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    defaultEdgeOptions?: Partial<Edge>;
    fitView?: boolean;
    minZoom?: number;
    maxZoom?: number;
  }>;

  export function useNodesState(initial: Node[]): [Node[], (nodes: Node[]) => void, (changes: any) => void];
  export function useEdgesState(initial: Edge[]): [Edge[], (edges: Edge[]) => void, (changes: any) => void];
}
