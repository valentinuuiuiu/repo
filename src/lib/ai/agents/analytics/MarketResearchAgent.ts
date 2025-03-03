import { BaseAgent, AgentConfig } from '../../core/BaseAgent';
import { Task, AgentResponse } from '../../types';
import { prisma } from '../../../prisma';
import OpenAI from 'openai';

interface MarketTrend {
  keyword: string;
  growthRate: number;
  volume: number;
  competitionLevel: 'low' | 'medium' | 'high';
  relevanceScore: number;
}

interface CompetitorAnalysis {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  priceComparison?: 'lower' | 'similar' | 'higher';
  productQuality?: 'lower' | 'similar' | 'higher';
  uniqueSellingPoints?: string[];
}

interface MarketResearchReport {
  trends: MarketTrend[];
  competitors: CompetitorAnalysis[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  dataTimestamp: string;
  confidence: number;
}

/**
 * MarketResearchAgent handles market analysis, trend identification,
 * competitor analysis, and opportunity identification
 */
export class MarketResearchAgent extends BaseAgent {
  private externalDataSources: Map<string, Function>;
  
  constructor(config: AgentConfig) {
    super({
      ...config,
      capabilities: [
        'market_analysis',
        'trend_identification',
        'competitor_analysis',
        'opportunity_identification',
        'market_segmentation',
        'pricing_strategy',
        'product_gap_analysis'
      ],
      group: 'analytics'
    });
    
    this.externalDataSources = new Map();
    this.initializeDataSources();
  }

  /**
   * Execute a market research task
   */
  async executeTask(task: Task): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (task.type) {
        case 'market_analysis':
          result = await this.performMarketAnalysis(task.data);
          break;
        default:
          // Handle other market research tasks
          result = await this.handleGenericResearchTask(task);
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          confidence: result.confidence || 0.85,
          processingTime: Date.now() - startTime,
          modelUsed: 'gpt-4'
        }
      };
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  /**
   * Perform comprehensive market analysis
   */
  private async performMarketAnalysis(data: any): Promise<MarketResearchReport> {
    try {
      const { industry, targetMarket, timeframe, focusAreas } = data;
      
      // Collect data from various sources
      const marketTrends = await this.collectMarketTrends(industry, timeframe);
      const competitors = await this.analyzeCompetitors(industry, targetMarket);
      
      // Prepare data for analysis
      const analysisData = {
        industry,
        targetMarket,
        timeframe,
        focusAreas: focusAreas || ['trends', 'competitors', 'opportunities'],
        marketTrends,
        competitors
      };
      
      // Generate market analysis report
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a market research specialist. Analyze the provided market data and generate a comprehensive market research report.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let report: MarketResearchReport;
      
      try {
        report = JSON.parse(response || '{}');
      } catch (e) {
        // Create structured report from text response
        report = {
          trends: marketTrends,
          competitors,
          opportunities: this.extractListFromText(response || '', 'opportunities'),
          threats: this.extractListFromText(response || '', 'threats'),
          recommendations: this.extractListFromText(response || '', 'recommendations'),
          dataTimestamp: new Date().toISOString(),
          confidence: 0.8
        };
      }
      
      // Save report to database
      await prisma.marketResearch.create({
        data: {
          industry,
          targetMarket,
          report: report as any,
          createdAt: new Date()
        }
      });
      
      return report;
    } catch (error) {
      console.error('Error performing market analysis:', error);
      throw error;
    }
  }

  /**
   * Handle generic market research tasks
   */
  private async handleGenericResearchTask(task: Task): Promise<any> {
    const { action, data } = task.data;
    
    switch (action) {
      case 'trend_analysis':
        return await this.analyzeTrends(data);
      case 'competitor_analysis':
        return await this.analyzeCompetitor(data);
      case 'market_segmentation':
        return await this.segmentMarket(data);
      case 'product_gap_analysis':
        return await this.analyzeProductGap(data);
      default:
        throw new Error(`Unknown research action: ${action}`);
    }
  }

  /**
   * Analyze market trends
   */
  private async analyzeTrends(data: { industry: string, timeframe: string }): Promise<any> {
    try {
      const trends = await this.collectMarketTrends(data.industry, data.timeframe);
      
      // Analyze trends in depth
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a market trend analyst. Analyze these trends and provide insights on their impact and future trajectory.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            industry: data.industry,
            timeframe: data.timeframe,
            trends
          })
        }
      ];
      
      const response = await this.chat(prompt);
      let analysis;
      
      try {
        analysis = JSON.parse(response || '{}');
      } catch (e) {
        analysis = {
          trends,
          insights: this.extractListFromText(response || '', 'insights'),
          forecast: this.extractListFromText(response || '', 'forecast'),
          recommendations: this.extractListFromText(response || '', 'recommendations'),
          confidence: 0.85
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw error;
    }
  }

  /**
   * Analyze a specific competitor
   */
  private async analyzeCompetitor(data: { competitorName: string, industry: string }): Promise<any> {
    try {
      // Get competitor data
      const competitor = await prisma.competitor.findFirst({
        where: { name: data.competitorName }
      });
      
      // Collect additional data from external sources
      const externalData = await this.collectCompetitorData(data.competitorName);
      
      // Prepare data for analysis
      const analysisData = {
        competitor: competitor || { name: data.competitorName },
        industry: data.industry,
        externalData
      };
      
      // Generate competitor analysis
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a competitor analysis specialist. Analyze this competitor and provide insights on their strengths, weaknesses, and market position.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let analysis;
      
      try {
        analysis = JSON.parse(response || '{}');
      } catch (e) {
        analysis = {
          name: data.competitorName,
          strengths: this.extractListFromText(response || '', 'strengths'),
          weaknesses: this.extractListFromText(response || '', 'weaknesses'),
          opportunities: this.extractListFromText(response || '', 'opportunities'),
          threats: this.extractListFromText(response || '', 'threats'),
          marketPosition: response?.includes('market leader') ? 'leader' : 
                         response?.includes('challenger') ? 'challenger' : 'follower',
          confidence: 0.8
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing competitor:', error);
      throw error;
    }
  }

  /**
   * Segment a market
   */
  private async segmentMarket(data: { industry: string, targetMarket: string }): Promise<any> {
    try {
      // Get market data
      const marketData = await prisma.marketData.findFirst({
        where: { industry: data.industry }
      });
      
      // Prepare data for analysis
      const analysisData = {
        industry: data.industry,
        targetMarket: data.targetMarket,
        marketData: marketData || { industry: data.industry }
      };
      
      // Generate market segmentation
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a market segmentation specialist. Identify and analyze key market segments for this industry and target market.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let segmentation;
      
      try {
        segmentation = JSON.parse(response || '{}');
      } catch (e) {
        segmentation = {
          segments: this.extractListFromText(response || '', 'segments'),
          primarySegment: this.extractPrimarySegment(response || ''),
          segmentCharacteristics: {},
          recommendations: this.extractListFromText(response || '', 'recommendations'),
          confidence: 0.8
        };
      }
      
      return segmentation;
    } catch (error) {
      console.error('Error segmenting market:', error);
      throw error;
    }
  }

  /**
   * Analyze product gaps in the market
   */
  private async analyzeProductGap(data: { industry: string, productCategory: string }): Promise<any> {
    try {
      // Get product data
      const products = await prisma.product.findMany({
        where: { category: data.productCategory }
      });
      
      // Get competitor products
      const competitorProducts = await prisma.competitorProduct.findMany({
        where: { category: data.productCategory }
      });
      
      // Prepare data for analysis
      const analysisData = {
        industry: data.industry,
        productCategory: data.productCategory,
        ownProducts: products,
        competitorProducts
      };
      
      // Generate product gap analysis
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a product gap analyst. Identify gaps in the market and opportunities for new or improved products.`
        },
        {
          role: 'user' as const,
          content: JSON.stringify(analysisData)
        }
      ];
      
      const response = await this.chat(prompt);
      let analysis;
      
      try {
        analysis = JSON.parse(response || '{}');
      } catch (e) {
        analysis = {
          identifiedGaps: this.extractListFromText(response || '', 'gaps'),
          marketOpportunities: this.extractListFromText(response || '', 'opportunities'),
          competitiveAdvantages: this.extractListFromText(response || '', 'advantages'),
          recommendedFeatures: this.extractListFromText(response || '', 'features'),
          priorityLevel: response?.includes('high priority') ? 'high' : 
                        response?.includes('medium priority') ? 'medium' : 'low',
          confidence: 0.85
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing product gap:', error);
      throw error;
    }
  }

  /**
   * Collect market trends from various sources
   */
  private async collectMarketTrends(industry: string, timeframe: string): Promise<MarketTrend[]> {
    try {
      // Get trends from database
      const dbTrends = await prisma.marketTrend.findMany({
        where: { 
          industry,
          createdAt: {
            gte: new Date(Date.now() - this.parseTimeframe(timeframe))
          }
        }
      });
      
      if (dbTrends.length > 0) {
        return dbTrends as unknown as MarketTrend[];
      }
      
      // If no trends in database, generate them
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a market trend analyst. Identify current trends in the ${industry} industry for the ${timeframe} timeframe.`
        },
        {
          role: 'user' as const,
          content: `Generate a list of market trends for the ${industry} industry. Include keyword, growth rate, volume, competition level, and relevance score for each trend.`
        }
      ];
      
      const response = await this.chat(prompt);
      let trends: MarketTrend[] = [];
      
      try {
        trends = JSON.parse(response || '[]');
      } catch (e) {
        // Extract trends from text response
        const lines = (response || '').split('\n');
        for (const line of lines) {
          if (line.includes(':') && !line.startsWith('#')) {
            const keyword = line.split(':')[0].trim();
            trends.push({
              keyword,
              growthRate: Math.random() * 20,
              volume: Math.floor(Math.random() * 1000),
              competitionLevel: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
              relevanceScore: Math.random() * 10
            });
          }
        }
      }
      
      // Save trends to database
      for (const trend of trends) {
        await prisma.marketTrend.create({
          data: {
            industry,
            keyword: trend.keyword,
            growthRate: trend.growthRate,
            volume: trend.volume,
            competitionLevel: trend.competitionLevel,
            relevanceScore: trend.relevanceScore,
            createdAt: new Date()
          }
        });
      }
      
      return trends;
    } catch (error) {
      console.error('Error collecting market trends:', error);
      return [];
    }
  }

  /**
   * Analyze competitors in an industry
   */
  private async analyzeCompetitors(industry: string, targetMarket: string): Promise<CompetitorAnalysis[]> {
    try {
      // Get competitors from database
      const dbCompetitors = await prisma.competitor.findMany({
        where: { 
          industry,
          targetMarkets: { has: targetMarket }
        }
      });
      
      if (dbCompetitors.length > 0) {
        return dbCompetitors.map(c => ({
          name: c.name,
          strengths: c.strengths as string[],
          weaknesses: c.weaknesses as string[],
          marketShare: c.marketShare,
          priceComparison: c.priceComparison as 'lower' | 'similar' | 'higher',
          productQuality: c.productQuality as 'lower' | 'similar' | 'higher',
          uniqueSellingPoints: c.uniqueSellingPoints as string[]
        }));
      }
      
      // If no competitors in database, generate them
      const prompt = [
        {
          role: 'system' as const,
          content: `You are ${this.name}, a competitor analyst. Identify and analyze key competitors in the ${industry} industry for the ${targetMarket} market.`
        },
        {
          role: 'user' as const,
          content: `Generate a list of 5 key competitors in the ${industry} industry. Include name, strengths, weaknesses, market share, price comparison, product quality, and unique selling points for each competitor.`
        }
      ];
      
      const response = await this.chat(prompt);
      let competitors: CompetitorAnalysis[] = [];
      
      try {
        competitors = JSON.parse(response || '[]');
      } catch (e) {
        // Extract competitors from text response
        const sections = (response || '').split(/\d+\./);
        for (const section of sections) {
          if (section.trim()) {
            const lines = section.split('\n');
            const name = lines[0]?.trim();
            if (name) {
              competitors.push({
                name,
                strengths: this.extractListFromText(section, 'strengths'),
                weaknesses: this.extractListFromText(section, 'weaknesses'),
                marketShare: Math.random() * 30,
                priceComparison: Math.random() > 0.6 ? 'higher' : Math.random() > 0.3 ? 'similar' : 'lower',
                productQuality: Math.random() > 0.6 ? 'higher' : Math.random() > 0.3 ? 'similar' : 'lower',
                uniqueSellingPoints: this.extractListFromText(section, 'unique')
              });
            }
          }
        }
      }
      
      // Save competitors to database
      for (const competitor of competitors) {
        await prisma.competitor.create({
          data: {
            name: competitor.name,
            industry,
            targetMarkets: [targetMarket],
            strengths: competitor.strengths,
            weaknesses: competitor.weaknesses,
            marketShare: competitor.marketShare,
            priceComparison: competitor.priceComparison,
            productQuality: competitor.productQuality,
            uniqueSellingPoints: competitor.uniqueSellingPoints,
            createdAt: new Date()
          }
        });
      }
      
      return competitors;
    } catch (error) {
      console.error('Error analyzing competitors:', error);
      return [];
    }
  }

  /**
   * Collect competitor data from external sources
   */
  private async collectCompetitorData(competitorName: string): Promise<any> {
    try {
      const results: Record<string, any> = {};
      
      for (const [sourceName, sourceFunction] of this.externalDataSources.entries()) {
        try {
          results[sourceName] = await sourceFunction(competitorName);
        } catch (error) {
          console.error(`Error collecting data from ${sourceName}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error collecting competitor data:', error);
      return {};
    }
  }

  /**
   * Initialize external data sources
   */
  private initializeDataSources(): void {
    // Mock data sources for now
    this.externalDataSources.set('socialMedia', async (name: string) => {
      return {
        followers: Math.floor(Math.random() * 100000),
        engagement: Math.random() * 5,
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        recentPosts: []
      };
    });
    
    this.externalDataSources.set('newsArticles', async (name: string) => {
      return {
        recentArticles: [],
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        topMentions: []
      };
    });
    
    this.externalDataSources.set('financialData', async (name: string) => {
      return {
        revenue: Math.floor(Math.random() * 1000000000),
        growth: Math.random() * 30 - 10,
        employees: Math.floor(Math.random() * 10000)
      };
    });
  }

  /**
   * Parse timeframe string to milliseconds
   */
  private parseTimeframe(timeframe: string): number {
    const now = Date.now();
    
    if (timeframe.includes('day')) {
      const days = parseInt(timeframe) || 1;
      return days * 24 * 60 * 60 * 1000;
    } else if (timeframe.includes('week')) {
      const weeks = parseInt(timeframe) || 1;
      return weeks * 7 * 24 * 60 * 60 * 1000;
    } else if (timeframe.includes('month')) {
      const months = parseInt(timeframe) || 1;
      return months * 30 * 24 * 60 * 60 * 1000;
    } else if (timeframe.includes('year')) {
      const years = parseInt(timeframe) || 1;
      return years * 365 * 24 * 60 * 60 * 1000;
    }
    
    return 30 * 24 * 60 * 60 * 1000; // Default to 30 days
  }

  /**
   * Extract a list from text based on a keyword
   */
  private extractListFromText(text: string, keyword: string): string[] {
    const result: string[] = [];
    const lines = text.split('\n');
    let inSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase()) && line.includes(':')) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.trim()) {
        if (line.match(/^[A-Z0-9]/) && !line.includes('-') && !line.includes('•')) {
          inSection = false;
          continue;
        }
        
        const item = line.replace(/^[-•*]\s*/, '').trim();
        if (item) {
          result.push(item);
        }
      }
    }
    
    return result;
  }

  /**
   * Extract primary segment from text
   */
  private extractPrimarySegment(text: string): string {
    if (text.includes('primary segment')) {
      const match = text.match(/primary segment[:\s]+([^.]+)/i);
      return match ? match[1].trim() : '';
    }
    
    return '';
  }
}