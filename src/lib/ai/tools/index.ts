/**
 * AI Tools Index
 * 
 * This file exports all available AI tools and the tool registry.
 * Import this file to access all tools in a convenient way.
 */

// Export individual tools
export { default as DDGSSearchTool } from './ddgsSearch';
export { default as WikipediaSearchTool } from './wikipediaSearch';

// Export tool registry
export { default as toolRegistry, ToolRegistry } from './toolRegistry';
export type { ToolMetadata, ToolCategory } from './toolRegistry';

// Export interfaces and types from tools
export type {
  SearchResult,
  DDGSSearchOptions,
  TimeRange,
  InfoType
} from './ddgsSearch';

export type {
  WikipediaSearchResult,
  WikipediaArticle,
  WikipediaSection,
  WikipediaSearchOptions
} from './wikipediaSearch';

// Tool usage examples
export const examples = {
  ddgsSearch: `
    // Example: Search the web using DuckDuckGo
    import { toolRegistry } from 'lib/ai/tools';
    
    const searchTool = toolRegistry.getTool('ddgsSearch');
    const results = await searchTool.search('climate change solutions');
    console.log(results);
    
    // Extract facts from search results
    const facts = searchTool.extractInformation(results, 'facts');
    console.log(facts);
  `,
  
  wikipediaSearch: `
    // Example: Search Wikipedia and get article details
    import { toolRegistry } from 'lib/ai/tools';
    
    const wikiTool = toolRegistry.getTool('wikipediaSearch');
    
    // Search for articles
    const searchResults = await wikiTool.search('artificial intelligence');
    console.log(searchResults);
    
    // Get full article details
    const article = await wikiTool.getArticle('Artificial intelligence', {
      getSections: true,
      getCategories: true
    });
    console.log(article);
    
    // Get just a summary
    const summary = await wikiTool.getSummary('Machine learning');
    console.log(summary);
  `
};