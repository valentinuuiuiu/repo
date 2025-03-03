/**
 * AI Agents Index
 * 
 * This file exports all available AI agents.
 * Import this file to access all agents in a convenient way.
 */

// Export individual agents
export { default as ResearchAgent } from './researchAgent';

// Export interfaces and types from agents
export type {
  ResearchQuery,
  ResearchResult
} from './researchAgent';

// Agent usage examples
export const examples = {
  researchAgent: `
    // Example: Use the Research Agent to gather information
    import { ResearchAgent } from 'lib/ai/agents';
    
    const agent = new ResearchAgent();
    
    // Basic research
    const basicResults = await agent.research({
      topic: 'renewable energy',
      depth: 'basic'
    });
    console.log(basicResults);
    
    // Comprehensive research with specific information types
    const detailedResults = await agent.research({
      topic: 'quantum computing',
      infoTypes: ['facts', 'definitions', 'tutorials'],
      depth: 'comprehensive',
      sources: ['both'],
      maxResults: 15
    });
    console.log(detailedResults);
  `
};