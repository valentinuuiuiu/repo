import axios, { AxiosError } from 'axios';

/**
 * Wikipedia Search Tool
 * 
 * This tool allows agents to search Wikipedia and extract structured information.
 * It provides capabilities for searching articles, getting summaries, and extracting
 * specific sections from Wikipedia pages.
 */
export interface WikipediaSearchResult {
  title: string;
  pageid: number;
  snippet: string;
  url: string;
}

export interface WikipediaArticle {
  title: string;
  pageid: number;
  extract: string;
  url: string;
  sections?: WikipediaSection[];
  categories?: string[];
  images?: string[];
  lastModified?: string;
}

export interface WikipediaSection {
  title: string;
  level: number;
  content: string;
  subsections?: WikipediaSection[];
}

export interface WikipediaSearchOptions {
  limit?: number;
  language?: string;
  extractLength?: number; // Character limit for extracts
  getSections?: boolean;
  getCategories?: boolean;
  getImages?: boolean;
}

export class WikipediaSearchTool {
  private baseUrl = 'https://en.wikipedia.org/w/api.php';
  private defaultOptions: WikipediaSearchOptions = {
    limit: 5,
    language: 'en',
    extractLength: 1000,
    getSections: false,
    getCategories: false,
    getImages: false
  };

  /**
   * Set the language for Wikipedia searches
   * 
   * @param language Two-letter language code (e.g., 'en', 'es', 'fr')
   */
  setLanguage(language: string): void {
    this.defaultOptions.language = language;
    this.baseUrl = `https://${language}.wikipedia.org/w/api.php`;
  }

  /**
   * Search Wikipedia for articles matching the query
   * 
   * @param query The search query
   * @param options Search options
   * @returns Array of search results
   */
  async search(query: string, options?: WikipediaSearchOptions): Promise<WikipediaSearchResult[]> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          format: 'json',
          srlimit: mergedOptions.limit,
          origin: '*'
        }
      });

      if (!response.data?.query?.search) {
        return [];
      }

      // Process and format the results
      const results: WikipediaSearchResult[] = response.data.query.search.map((item: any) => ({
        title: item.title,
        pageid: item.pageid,
        snippet: this.cleanSnippet(item.snippet),
        url: `https://${mergedOptions.language}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`
      }));

      return results;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error performing Wikipedia search:', axiosError);
      throw new Error(`Wikipedia search failed: ${axiosError.message}`);
    }
  }

  /**
   * Get detailed information about a Wikipedia article
   * 
   * @param title The title of the Wikipedia article or pageid
   * @param options Options for article retrieval
   * @returns Detailed article information
   */
  async getArticle(titleOrPageId: string | number, options?: WikipediaSearchOptions): Promise<WikipediaArticle | null> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const isPageId = typeof titleOrPageId === 'number';
    
    try {
      // First, get the basic article content
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          prop: 'extracts|info',
          exintro: mergedOptions.extractLength ? 0 : 1, // 1 for just intro, 0 for full content
          explaintext: 1,
          inprop: 'url|displaytitle',
          format: 'json',
          ...(isPageId ? { pageids: titleOrPageId } : { titles: titleOrPageId }),
          exlimit: 1,
          origin: '*',
          ...(mergedOptions.extractLength ? { exchars: mergedOptions.extractLength } : {})
        }
      });

      const pages = response.data?.query?.pages;
      if (!pages) {
        return null;
      }

      // Wikipedia API returns an object with page IDs as keys
      const pageId = Object.keys(pages)[0];
      if (pageId === '-1') {
        return null; // Page not found
      }

      const page = pages[pageId];
      
      const article: WikipediaArticle = {
        title: page.title,
        pageid: parseInt(pageId),
        extract: page.extract,
        url: page.fullurl || `https://${mergedOptions.language}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
        lastModified: page.touched
      };

      // Get additional information if requested
      if (mergedOptions.getSections) {
        article.sections = await this.getArticleSections(article.pageid);
      }
      
      if (mergedOptions.getCategories) {
        article.categories = await this.getArticleCategories(article.pageid);
      }
      
      if (mergedOptions.getImages) {
        article.images = await this.getArticleImages(article.pageid);
      }

      return article;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error retrieving Wikipedia article:', axiosError);
      throw new Error(`Wikipedia article retrieval failed: ${axiosError.message}`);
    }
  }

  /**
   * Get a quick summary of a Wikipedia article
   * 
   * @param title The title of the Wikipedia article
   * @param maxLength Maximum length of the summary in characters
   * @returns Article summary
   */
  async getSummary(title: string, maxLength: number = 500): Promise<string> {
    try {
      const article = await this.getArticle(title, { extractLength: maxLength });
      return article?.extract || 'No summary available';
    } catch (error) {
      console.error('Error getting Wikipedia summary:', error);
      return 'Failed to retrieve summary';
    }
  }

  /**
   * Extract specific sections from a Wikipedia article
   * 
   * @param article The Wikipedia article
   * @param sectionTitles Array of section titles to extract (case insensitive, partial match)
   * @returns Object with section titles as keys and content as values
   */
  extractSections(article: WikipediaArticle, sectionTitles: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    
    if (!article.sections) {
      return result;
    }
    
    const normalizedTitles = sectionTitles.map(title => title.toLowerCase());
    
    const findSections = (sections: WikipediaSection[]) => {
      for (const section of sections) {
        const sectionLower = section.title.toLowerCase();
        
        for (const title of normalizedTitles) {
          if (sectionLower.includes(title)) {
            result[section.title] = section.content;
          }
        }
        
        if (section.subsections) {
          findSections(section.subsections);
        }
      }
    };
    
    findSections(article.sections);
    return result;
  }

  /**
   * Find related Wikipedia articles
   * 
   * @param title The title of the Wikipedia article
   * @param limit Maximum number of related articles to return
   * @returns Array of related article titles
   */
  async findRelatedArticles(title: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          prop: 'links',
          titles: title,
          pllimit: limit,
          format: 'json',
          origin: '*'
        }
      });

      const pages = response.data?.query?.pages;
      if (!pages) {
        return [];
      }

      const pageId = Object.keys(pages)[0];
      if (pageId === '-1' || !pages[pageId].links) {
        return [];
      }

      return pages[pageId].links.map((link: any) => link.title);
    } catch (error) {
      console.error('Error finding related Wikipedia articles:', error);
      return [];
    }
  }

  // Private helper methods
  private cleanSnippet(snippet: string): string {
    // Remove HTML tags from snippet
    return snippet.replace(/<\/?[^>]+(>|$)/g, '');
  }

  private async getArticleSections(pageId: number): Promise<WikipediaSection[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'parse',
          pageid: pageId,
          prop: 'sections|text',
          format: 'json',
          origin: '*'
        }
      });

      if (!response.data?.parse?.sections) {
        return [];
      }

      const sections: WikipediaSection[] = [];
      const rawSections = response.data.parse.sections;
      const content = response.data.parse.text['*'];

      // This is a simplified implementation
      // A full implementation would parse the HTML content to extract section text
      for (const section of rawSections) {
        sections.push({
          title: section.line,
          level: parseInt(section.level),
          content: `Content for section ${section.line} (requires HTML parsing)`,
          subsections: []
        });
      }

      // Build section hierarchy
      return this.buildSectionHierarchy(sections);
    } catch (error) {
      console.error('Error retrieving article sections:', error);
      return [];
    }
  }

  private buildSectionHierarchy(sections: WikipediaSection[]): WikipediaSection[] {
    const result: WikipediaSection[] = [];
    const stack: WikipediaSection[] = [];

    for (const section of sections) {
      while (stack.length > 0 && stack[stack.length - 1].level >= section.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        result.push(section);
      } else {
        const parent = stack[stack.length - 1];
        if (!parent.subsections) {
          parent.subsections = [];
        }
        parent.subsections.push(section);
      }

      stack.push(section);
    }

    return result;
  }

  private async getArticleCategories(pageId: number): Promise<string[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          prop: 'categories',
          pageids: pageId,
          cllimit: 50,
          format: 'json',
          origin: '*'
        }
      });

      const pages = response.data?.query?.pages;
      if (!pages || !pages[pageId] || !pages[pageId].categories) {
        return [];
      }

      return pages[pageId].categories.map((cat: any) => cat.title.replace('Category:', ''));
    } catch (error) {
      console.error('Error retrieving article categories:', error);
      return [];
    }
  }

  private async getArticleImages(pageId: number): Promise<string[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          action: 'query',
          prop: 'images',
          pageids: pageId,
          imlimit: 20,
          format: 'json',
          origin: '*'
        }
      });

      const pages = response.data?.query?.pages;
      if (!pages || !pages[pageId] || !pages[pageId].images) {
        return [];
      }

      return pages[pageId].images.map((img: any) => img.title);
    } catch (error) {
      console.error('Error retrieving article images:', error);
      return [];
    }
  }
}

export default WikipediaSearchTool;