import { toolRegistry } from '../tools';
import type { DDGSSearchTool } from '../tools';
import type { WikipediaSearchTool } from '../tools';
import type { InfoType } from '../tools';

/**
 * Research Agent
 * 
 * An agent specialized in gathering and synthesizing information from multiple sources.
 * It can perform web searches, extract specific types of information, and compile
 * comprehensive research reports.
 */

export interface ResearchQuery {
  topic: string;
  infoTypes?: InfoType[];
  depth?: 'basic' | 'detailed' | 'comprehensive';
  sources?: ('web' | 'wikipedia' | 'both')[];
  maxResults?: number;
}

export interface ResearchResult {
  topic: string;
  summary: string;
  facts: string[];
  definitions: string[];
  opinions: string[];
  tutorials?: string[];
  news?: string[];
  sources: {
    title: string;
    url: string;
    relevance: number;
  }[];
  relatedTopics?: string[];
}

export class ResearchAgent {
  private ddgsSearch: DDGSSearchTool;
  private wikipediaSearch: WikipediaSearchTool;
  
  constructor() {
    // Get tools from registry
    this.ddgsSearch = toolRegistry.getTool<DDGSSearchTool>('ddgsSearch')!;
    this.wikipediaSearch = toolRegistry.getTool<WikipediaSearchTool>('wikipediaSearch')!;
    
    if (!this.ddgsSearch || !this.wikipediaSearch) {
      throw new Error('Required tools not found in registry');
    }
  }
  
  /**
   * Perform research on a topic
   * 
   * @param query Research query parameters
   * @returns Compiled research results
   */
  async research(query: ResearchQuery): Promise<ResearchResult> {
    const {
      topic,
      infoTypes = ['facts', 'definitions', 'opinions'],
      depth = 'detailed',
      sources = ['both'],
      maxResults = 10
    } = query;
    
    // Initialize result structure
    const result: ResearchResult = {
      topic,
      summary: '',
      facts: [],
      definitions: [],
      opinions: [],
      tutorials: [],
      news: [],
      sources: [],
      relatedTopics: []
    };
    
    // Determine which sources to use
    const useWeb = sources.includes('both') || sources.includes('web');
    const useWikipedia = sources.includes('both') || sources.includes('wikipedia');
    
    // Adjust max results based on depth
    const resultsMultiplier = depth === 'basic' ? 1 : depth === 'detailed' ? 2 : 3;
    const adjustedMaxResults = maxResults * resultsMultiplier;
    
    // Gather information from Wikipedia if requested
    if (useWikipedia) {
      await this.gatherWikipediaInformation(topic, result, depth);
    }
    
    // Gather information from web search if requested
    if (useWeb) {
      await this.gatherWebInformation(topic, infoTypes, result, adjustedMaxResults);
    }
    
    // Generate a summary if we don't already have one from Wikipedia
    if (!result.summary && result.facts.length > 0) {
      result.summary = this.generateSummary(result);
    }
    
    // Find related topics if we're doing comprehensive research
    if (depth === 'comprehensive') {
      result.relatedTopics = await this.findRelatedTopics(topic);
    }
    
    return result;
  }
  
  /**
   * Gather information from Wikipedia
   * 
   * @param topic Research topic
   * @param result Result object to populate
   * @param depth Research depth
   */
  private async gatherWikipediaInformation(
    topic: string, 
    result: ResearchResult,
    depth: 'basic' | 'detailed' | 'comprehensive'
  ): Promise<void> {
    try {
      // Search for the topic on Wikipedia
      const searchResults = await this.wikipediaSearch.search(topic, { limit: 3 });
      
      if (searchResults.length === 0) {
        return;
      }
      
      // Get the most relevant article
      const topResult = searchResults[0];
      
      // Add to sources
      result.sources.push({
        title: topResult.title,
        url: topResult.url,
        relevance: 1.0
      });
      
      // Get article details based on depth
      const getSections = depth !== 'basic';
      const getCategories = depth === 'comprehensive';
      
      const article = await this.wikipediaSearch.getArticle(topResult.title, {
        getSections,
        getCategories,
        extractLength: depth === 'basic' ? 500 : depth === 'detailed' ? 1500 : 3000
      });
      
      if (!article) {
        return;
      }
      
      // Set the summary from the article extract
      result.summary = article.extract;
      
      // Extract facts and definitions from the article content
      const articleText = article.extract.toLowerCase();
      
      // Simple fact extraction (could be improved with NLP)
      if (articleText.includes('is a') || articleText.includes('are')) {
        const sentences = article.extract.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (
            sentence.toLowerCase().includes('is a') || 
            sentence.toLowerCase().includes('are') ||
            sentence.toLowerCase().includes('was') ||
            sentence.toLowerCase().includes('were')
          ) {
            result.facts.push(sentence.trim());
          }
        }
      }
      
      // For comprehensive research, get related topics
      if (depth === 'comprehensive' && article.categories) {
        result.relatedTopics = article.categories.slice(0, 5);
      }
    } catch (error) {
      console.error('Error gathering Wikipedia information:', error);
    }
  }
  
  /**
   * Gather information from web search
   * 
   * @param topic Research topic
   * @param infoTypes Types of information to gather
   * @param result Result object to populate
   * @param maxResults Maximum number of results to process
   */
  private async gatherWebInformation(
    topic: string,
    infoTypes: InfoType[],
    result: ResearchResult,
    maxResults: number
  ): Promise<void> {
    try {
      // Perform web search
      const searchResults = await this.ddgsSearch.search(topic, { maxResults });
      
      // Add sources
      searchResults.forEach((sr, index) => {
        result.sources.push({
          title: sr.title,
          url: sr.url,
          relevance: sr.relevanceScore || (1 - index * 0.1)
        });
      });
      
      // Extract different types of information
      for (const infoType of infoTypes) {
        const extractedInfo = this.ddgsSearch.extractInformation(searchResults, infoType);
        
        switch (infoType) {
          case 'facts':
            result.facts = [...result.facts, ...extractedInfo];
            break;
          case 'definitions':
            result.definitions = extractedInfo;
            break;
          case 'opinions':
            result.opinions = extractedInfo;
            break;
          case 'tutorials':
            result.tutorials = extractedInfo;
            break;
          case 'news':
            result.news = extractedInfo;
            break;
        }
      }
      
      // Remove duplicates
      result.facts = [...new Set(result.facts)];
      result.definitions = [...new Set(result.definitions)];
      result.opinions = [...new Set(result.opinions)];
      if (result.tutorials) result.tutorials = [...new Set(result.tutorials)];
      if (result.news) result.news = [...new Set(result.news)];
    } catch (error) {
      console.error('Error gathering web information:', error);
    }
  }
  
  /**
   * Generate a summary from the gathered information
   * 
   * @param result Research results
   * @returns Generated summary
   */
  private generateSummary(result: ResearchResult): string {
    // In a real implementation, this would use an LLM to generate a coherent summary
    // For now, we'll just concatenate some facts
    
    if (result.facts.length === 0) {
      return 'No information found to generate a summary.';
    }
    
    // Take up to 3 facts and join them
    const topFacts = result.facts.slice(0, 3);
    return topFacts.join(' ');
  }
  
  /**
   * Find topics related to the main research topic
   * 
   * @param topic Main research topic
   * @returns Array of related topics
   */
  private async findRelatedTopics(topic: string): Promise<string[]> {
    try {
      // Try to find related topics from Wikipedia
      const searchResults = await this.wikipediaSearch.search(topic, { limit: 1 });
      
      if (searchResults.length > 0) {
        const relatedArticles = await this.wikipediaSearch.findRelatedArticles(searchResults[0].title, 5);
        if (relatedArticles.length > 0) {
          return relatedArticles;
        }
      }
      
      // Fallback: use web search with "related to [topic]" query
      const searchResults2 = await this.ddgsSearch.search(`related to ${topic}`, { maxResults: 5 });
      return searchResults2.map(result => result.title);
    } catch (error) {
      console.error('Error finding related topics:', error);
      return [];
    }
  }
}

export default ResearchAgent;