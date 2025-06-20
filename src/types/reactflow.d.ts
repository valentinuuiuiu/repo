import { CSSProperties, ComponentType, FC } from 'react';

declare module 'reactflow' {

  export type Position = 'top' | 'right' | 'bottom' | 'left';
  export type HandleType = 'source' | 'target';
  export type MarkerType = { type: string; color?: string };

  export interface NodeProps {
    id: string;
    data: any;
    type?: string;
    position: { x: number; y: number };
    style?: React.CSSProperties;
    className?: string;
    sourcePosition?: Position;
    targetPosition?: Position;
    selected?: boolean;
    dragging?: boolean;
  }

  export interface EdgeProps {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    labelStyle?: React.CSSProperties;
    labelShowBg?: boolean;
    labelBgStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    animated?: boolean;
    markerEnd?: MarkerType;
    data?: any;
  }

  export interface NodeTypes {
    default: React.ComponentType<NodeProps>;
    [key: string]: React.ComponentType<NodeProps>;
  }

  export interface EdgeTypes {
    default: React.ComponentType<EdgeProps>;
    [key: string]: React.ComponentType<EdgeProps>;
  }

  export const Handle: React.FC<{
    type: HandleType;
    position: Position;
    id?: string;
    style?: React.CSSProperties;
    className?: string;
  }>;

  export const ReactFlow: React.FC<{
    nodes: NodeProps[];
    edges: EdgeProps[];
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    defaultEdgeOptions?: Partial<EdgeProps>;
    fitView?: boolean;
    onNodesChange?: (changes: any) => void;
    onEdgesChange?: (changes: any) => void;
  }>;

  export function useNodesState(initial: NodeProps[]): [NodeProps[], (nodes: NodeProps[]) => void];
  export function useEdgesState(initial: EdgeProps[]): [EdgeProps[], (edges: EdgeProps[]) => void];
  export function useReactFlow(): any;
}
