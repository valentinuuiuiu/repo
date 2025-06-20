/**
 * AI Library
 * 
 * This is the main entry point for the AI library.
 * It exports all tools, agents, and utilities for building AI-powered features.
 */

// Export tools
export * from './tools';

// Export agents
export * from './agents';

// Library information
export const libraryInfo = {
  name: 'AI Library',
  version: '1.0.0',
  description: 'A comprehensive library for building AI-powered features',
  capabilities: [
    'Web search and information extraction',
    'Wikipedia knowledge access',
    'Research and information synthesis',
    // Add more capabilities as they are implemented
  ]
};

// Quick start example
export const quickStart = `
  // Quick Start Example
  import { toolRegistry, ResearchAgent } from 'lib/ai';
  
  // Using tools directly
  const searchTool = toolRegistry.getTool('ddgsSearch');
  const results = await searchTool.search('climate change solutions');
  
  // Using an agent for higher-level tasks
  const agent = new ResearchAgent();
  const research = await agent.research({
    topic: 'artificial intelligence ethics',
    depth: 'detailed'
  });
  
  console.log(research.summary);
  console.log(\`Found \${research.facts.length} facts and \${research.sources.length} sources\`);
`;

// Export default object with all components
export default {
  ...(await Promise.all([
    import('./tools'),
    import('./agents')
  ]).then(([tools, agents]) => ({
    tools: tools.default,
    agents: agents.default,
    info: libraryInfo
  })))
};