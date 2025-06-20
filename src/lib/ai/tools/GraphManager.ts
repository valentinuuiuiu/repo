/**
 * GraphManager
 * 
 * A tool for managing knowledge graphs, inspired by Raiden.ai's approach.
 * This allows agents to store and retrieve information in a graph structure,
 * enabling complex reasoning and relationship discovery.
 */

import { EventEmitter } from 'events';

export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphQuery {
  startNodeId?: string;
  nodeTypes?: string[];
  edgeTypes?: string[];
  properties?: Record<string, any>;
  maxDepth?: number;
  limit?: number;
}

export class GraphManager {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;
  private eventBus: EventEmitter;
  
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.eventBus = new EventEmitter();
  }
  
  /**
   * Add a node to the graph
   */
  addNode(node: GraphNode): GraphNode {
    this.nodes.set(node.id, node);
    this.eventBus.emit('node:added', node);
    return node;
  }
  
  /**
   * Add an edge between two nodes
   */
  addEdge(edge: GraphEdge): GraphEdge {
    this.edges.set(edge.id, edge);
    this.eventBus.emit('edge:added', edge);
    return edge;
  }
  
  /**
   * Get a node by ID
   */
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }
  
  /**
   * Get an edge by ID
   */
  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }
  
  /**
   * Update a node's properties
   */
  updateNode(id: string, properties: Record<string, any>): GraphNode | undefined {
    const node = this.nodes.get(id);
    
    if (!node) {
      return undefined;
    }
    
    const updatedNode: GraphNode = {
      ...node,
      properties: {
        ...node.properties,
        ...properties
      }
    };
    
    this.nodes.set(id, updatedNode);
    return updatedNode;
  }
  
  /**
   * Update an edge's properties
   */
  updateEdge(edgeId: string, properties: Record<string, any>): GraphEdge | undefined {
    const edge = this.edges.get(edgeId);
    if (!edge) return undefined;

    const updatedEdge = {
      ...edge,
      properties: { ...edge.properties, ...properties }
    };
    this.edges.set(edgeId, updatedEdge);
    return updatedEdge;
  }

  /**
   * Query the graph
   */
  query({ startNodeId, nodeTypes, edgeTypes, maxDepth }: {
    startNodeId?: string;
    nodeTypes?: string[];
    edgeTypes?: string[];
    maxDepth?: number;
  }): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const resultNodes = new Set<GraphNode>();
    const resultEdges = new Set<GraphEdge>();

    if (startNodeId) {
      this.traverseGraph(startNodeId, resultNodes, resultEdges, nodeTypes, edgeTypes, maxDepth, 0);
    } else {
      // If no start node, filter all nodes/edges by type
      for (const node of this.nodes.values()) {
        if (!nodeTypes || nodeTypes.includes(node.type)) {
          resultNodes.add(node);
        }
      }
      for (const edge of this.edges.values()) {
        if (!edgeTypes || edgeTypes.includes(edge.type)) {
          resultEdges.add(edge);
        }
      }
    }

    return {
      nodes: Array.from(resultNodes),
      edges: Array.from(resultEdges)
    };
  }
  
  /**
   * Get all paths between two nodes
   */
  findPaths(sourceId: string, targetId: string, maxDepth: number): GraphEdge[][] {
    const paths: GraphEdge[][] = [];
    const visited = new Set<string>();
    
    const dfs = (currentId: string, currentPath: GraphEdge[], depth: number) => {
      if (depth > maxDepth) return;
      if (currentId === targetId) {
        paths.push([...currentPath]);
        return;
      }
      
      visited.add(currentId);
      
      for (const edge of this.edges.values()) {
        if (edge.source === currentId && !visited.has(edge.target)) {
          dfs(edge.target, [...currentPath, edge], depth + 1);
        }
      }
      
      visited.delete(currentId);
    };
    
    dfs(sourceId, [], 0);
    return paths;
  }
  
  /**
   * Get a visualization-friendly representation of the graph
   */
  getVisualizationData(): { nodes: any[]; edges: any[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }
  
  /**
   * Calculate centrality metrics for nodes
   */
  calculateCentrality(): Record<string, { betweenness: number; degree: number }> {
    const centrality: Record<string, { betweenness: number; degree: number }> = {};
    
    // Initialize
    for (const nodeId of this.nodes.keys()) {
      centrality[nodeId] = { betweenness: 0, degree: 0 };
    }
    
    // Calculate degree centrality
    for (const edge of this.edges.values()) {
      centrality[edge.source].degree++;
      centrality[edge.target].degree++;
    }
    
    // Simple betweenness centrality approximation
    for (const node of this.nodes.values()) {
      const paths = this.findAllShortestPaths(node.id);
      for (const path of paths) {
        for (const nodeId of path) {
          if (nodeId !== node.id) {
            centrality[nodeId].betweenness++;
          }
        }
      }
    }
    
    return centrality;
  }
  
  /**
   * Find communities in the graph
   */
  findCommunities(): string[][] {
    // Simple community detection using connected components
    const visited = new Set<string>();
    const communities: string[][] = [];
    
    for (const node of this.nodes.values()) {
      if (!visited.has(node.id)) {
        const community: string[] = [];
        this.dfsVisit(node.id, visited, community);
        communities.push(community);
      }
    }
    
    return communities;
  }

  private dfsVisit(nodeId: string, visited: Set<string>, component: string[]) {
    visited.add(nodeId);
    component.push(nodeId);
    
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        this.dfsVisit(edge.target, visited, component);
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        this.dfsVisit(edge.source, visited, component);
      }
    }
  }

  private findAllShortestPaths(startId: string): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();
    const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      paths.push(path);
      
      for (const edge of this.edges.values()) {
        if (edge.source === id && !visited.has(edge.target)) {
          queue.push({ id: edge.target, path: [...path, edge.target] });
        }
        if (edge.target === id && !visited.has(edge.source)) {
          queue.push({ id: edge.source, path: [...path, edge.source] });
        }
      }
    }
    
    return paths;
  }

  private traverseGraph(
    nodeId: string,
    resultNodes: Set<GraphNode>,
    resultEdges: Set<GraphEdge>,
    nodeTypes?: string[],
    edgeTypes?: string[],
    maxDepth?: number,
    currentDepth: number = 0
  ): void {
    if (maxDepth !== undefined && currentDepth > maxDepth) return;
    
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    if (!nodeTypes || nodeTypes.includes(node.type)) {
      resultNodes.add(node);
    }
    
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        if (!edgeTypes || edgeTypes.includes(edge.type)) {
          resultEdges.add(edge);
          const nextNodeId = edge.source === nodeId ? edge.target : edge.source;
          if (!resultNodes.has(this.nodes.get(nextNodeId)!)) {
            this.traverseGraph(
              nextNodeId,
              resultNodes,
              resultEdges,
              nodeTypes,
              edgeTypes,
              maxDepth,
              currentDepth + 1
            );
          }
        }
      }
    }
  }
}

export default GraphManager;