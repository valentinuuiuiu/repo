import axios, { AxiosError } from 'axios';

/**
 * DuckDuckGo Search Tool
 * 
 * This tool allows agents to search the web using DuckDuckGo's API.
 * It provides a clean interface for retrieving search results and extracting
 * relevant information.
 */
export interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: string;
  timestamp?: string;
  relevanceScore?: number;
}

export type TimeRange = 'd' | 'w' | 'm' | 'y'; // day, week, month, year
export type InfoType = 'facts' | 'definitions' | 'opinions' | 'tutorials' | 'news';

export interface DDGSSearchOptions {
  maxResults?: number;
  region?: string;
  safeSearch?: boolean;
  timeRange?: TimeRange;
  sortBy?: 'relevance' | 'date';
}

export class DDGSSearchTool {
  private baseUrl = 'https://api.duckduckgo.com/';
  private defaultOptions: DDGSSearchOptions = {
    maxResults: 5,
    region: 'wt-wt',
    safeSearch: true,
    timeRange: 'm',
    sortBy: 'relevance'
  };

  /**
   * Search the web using DuckDuckGo
   * 
   * @param query The search query
   * @param options Search options
   * @returns Array of search results
   */
  async search(query: string, options?: DDGSSearchOptions): Promise<SearchResult[]> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          no_redirect: 1,
          region: mergedOptions.region,
          safesearch: mergedOptions.safeSearch ? 1 : 0,
          time: mergedOptions.timeRange
        }
      });

      if (!response.data || !response.data.RelatedTopics) {
        return [];
      }

      // Process and format the results
      const results: SearchResult[] = response.data.RelatedTopics
        .filter((topic: any) => topic.Text && topic.FirstURL)
        .slice(0, mergedOptions.maxResults)
        .map((topic: any, index: number) => ({
          title: topic.Text.split(' - ')[0] || topic.Text,
          url: topic.FirstURL,
          description: topic.Text,
          source: 'DuckDuckGo',
          relevanceScore: 1 - (index * 0.1) // Simple relevance scoring based on position
        }));

      // Sort results if needed
      if (mergedOptions.sortBy === 'date' && response.data.RelatedTopics[0]?.FirstURL) {
        // Note: DuckDuckGo API doesn't provide dates directly, this is a placeholder
        // In a real implementation, you might need to fetch the pages and extract dates
        console.log('Date sorting not fully implemented with DuckDuckGo API');
      }

      return results;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error performing DuckDuckGo search:', axiosError);
      throw new Error(`DuckDuckGo search failed: ${axiosError.message}`);
    }
  }

  /**
   * Extract specific information from search results
   * 
   * @param results The search results to analyze
   * @param infoType The type of information to extract
   * @returns Extracted information
   */
  extractInformation(results: SearchResult[], infoType: InfoType): string[] {
    // This is a simplified implementation
    // In a real-world scenario, this would use NLP techniques to extract specific types of information
    
    const extractedInfo: string[] = [];
    
    for (const result of results) {
      const description = result.description.toLowerCase();
      
      switch (infoType) {
        case 'facts':
          if (description.includes('is a') || description.includes('are') || 
              description.includes('was') || description.includes('were')) {
            extractedInfo.push(result.description);
          }
          break;
        case 'definitions':
          if (description.includes('refers to') || description.includes('defined as') || 
              description.includes('means') || description.startsWith('a ') || 
              description.startsWith('the ')) {
            extractedInfo.push(result.description);
          }
          break;
        case 'opinions':
          if (description.includes('believe') || description.includes('think') || 
              description.includes('opinion') || description.includes('argue') || 
              description.includes('suggest')) {
            extractedInfo.push(result.description);
          }
          break;
        case 'tutorials':
          if (description.includes('how to') || description.includes('guide') || 
              description.includes('tutorial') || description.includes('learn') || 
              description.includes('steps')) {
            extractedInfo.push(result.description);
          }
          break;
        case 'news':
          if (description.includes('today') || description.includes('yesterday') || 
              description.includes('recent') || description.includes('latest') || 
              description.includes('update')) {
            extractedInfo.push(result.description);
          }
          break;
      }
    }
    
    return extractedInfo;
  }

  /**
   * Perform a focused search for a specific type of information
   * 
   * @param query The search query
   * @param infoType The type of information to search for
   * @param options Search options
   * @returns Extracted information matching the requested type
   */
  async searchForInformation(query: string, infoType: InfoType, options?: DDGSSearchOptions): Promise<string[]> {
    // Enhance query based on the information type
    let enhancedQuery = query;
    
    switch (infoType) {
      case 'facts':
        enhancedQuery += ' facts information';
        break;
      case 'definitions':
        enhancedQuery += ' definition meaning';
        break;
      case 'opinions':
        enhancedQuery += ' opinion perspective';
        break;
      case 'tutorials':
        enhancedQuery += ' tutorial guide how-to';
        break;
      case 'news':
        enhancedQuery += ' news recent latest';
        break;
    }
    
    const results = await this.search(enhancedQuery, {
      ...options,
      maxResults: options?.maxResults || 10 // Increase default for better extraction chances
    });
    
    return this.extractInformation(results, infoType);
  }
}

export default DDGSSearchTool;
