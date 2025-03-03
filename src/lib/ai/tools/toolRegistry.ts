import DDGSSearchTool from './ddgsSearch';
import WikipediaSearchTool from './wikipediaSearch';

/**
 * Tool Registry
 * 
 * A central registry for all AI agent tools. This allows for:
 * - Easy access to all available tools
 * - Tool discovery and metadata
 * - Consistent tool initialization and configuration
 * - Tool dependency management
 */

export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  category: ToolCategory;
  capabilities: string[];
  requiresAuth: boolean;
  rateLimited: boolean;
  author: string;
}

export type ToolCategory = 
  | 'search' 
  | 'knowledge' 
  | 'communication' 
  | 'data-processing'
  | 'code' 
  | 'media' 
  | 'utility';

export interface ToolRegistryOptions {
  enabledTools?: string[];
  defaultConfigs?: Record<string, any>;
}

export class ToolRegistry {
  private tools: Map<string, any> = new Map();
  private metadata: Map<string, ToolMetadata> = new Map();
  private options: ToolRegistryOptions;

  constructor(options: ToolRegistryOptions = {}) {
    this.options = options;
    this.registerDefaultTools();
  }

  /**
   * Register a tool with the registry
   * 
   * @param toolInstance The tool instance to register
   * @param metadata Metadata about the tool
   */
  registerTool(toolInstance: any, metadata: ToolMetadata): void {
    if (this.tools.has(metadata.name)) {
      console.warn(`Tool ${metadata.name} is already registered. Overwriting.`);
    }
    
    this.tools.set(metadata.name, toolInstance);
    this.metadata.set(metadata.name, metadata);
    
    console.log(`Registered tool: ${metadata.name} (${metadata.version})`);
  }

  /**
   * Get a tool instance by name
   * 
   * @param name The name of the tool to retrieve
   * @returns The tool instance or undefined if not found
   */
  getTool<T>(name: string): T | undefined {
    return this.tools.get(name) as T | undefined;
  }

  /**
   * Get metadata for a specific tool
   * 
   * @param name The name of the tool
   * @returns Tool metadata or undefined if not found
   */
  getToolMetadata(name: string): ToolMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Get all registered tools
   * 
   * @returns Map of all tool instances
   */
  getAllTools(): Map<string, any> {
    return this.tools;
  }

  /**
   * Get all tool metadata
   * 
   * @returns Map of all tool metadata
   */
  getAllToolMetadata(): Map<string, ToolMetadata> {
    return this.metadata;
  }

  /**
   * Get tools by category
   * 
   * @param category The category to filter by
   * @returns Array of tool names in the specified category
   */
  getToolsByCategory(category: ToolCategory): string[] {
    const result: string[] = [];
    
    this.metadata.forEach((meta, name) => {
      if (meta.category === category) {
        result.push(name);
      }
    });
    
    return result;
  }

  /**
   * Check if a tool is registered
   * 
   * @param name The name of the tool to check
   * @returns True if the tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Unregister a tool
   * 
   * @param name The name of the tool to unregister
   * @returns True if the tool was unregistered, false if it wasn't registered
   */
  unregisterTool(name: string): boolean {
    if (!this.tools.has(name)) {
      return false;
    }
    
    this.tools.delete(name);
    this.metadata.delete(name);
    return true;
  }

  /**
   * Register all default tools
   * 
   * This method initializes and registers all the standard tools
   * that come with the system.
   */
  private registerDefaultTools(): void {
    // Register DuckDuckGo Search Tool
    const ddgsSearch = new DDGSSearchTool();
    this.registerTool(ddgsSearch, {
      name: 'ddgsSearch',
      description: 'Search the web using DuckDuckGo',
      version: '1.0.0',
      category: 'search',
      capabilities: ['web-search', 'information-extraction'],
      requiresAuth: false,
      rateLimited: true,
      author: 'AI Tools Team'
    });

    // Register Wikipedia Search Tool
    const wikipediaSearch = new WikipediaSearchTool();
    this.registerTool(wikipediaSearch, {
      name: 'wikipediaSearch',
      description: 'Search and extract information from Wikipedia',
      version: '1.0.0',
      category: 'knowledge',
      capabilities: ['article-search', 'summary-extraction', 'section-extraction'],
      requiresAuth: false,
      rateLimited: true,
      author: 'AI Tools Team'
    });

    // Additional tools can be registered here
  }
}

// Create and export a singleton instance
const toolRegistry = new ToolRegistry();
export default toolRegistry;