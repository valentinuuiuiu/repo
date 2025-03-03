/**
 * AI Library Demo
 * 
 * This file demonstrates how to use the AI library components.
 */

import { 
  toolRegistry, 
  ResearchAgent,
  DDGSSearchTool,
  WikipediaSearchTool
} from '../lib/ai';

async function demoTools() {
  console.log('=== TOOLS DEMO ===');
  
  // Get tools from registry
  const searchTool = toolRegistry.getTool<DDGSSearchTool>('ddgsSearch');
  const wikiTool = toolRegistry.getTool<WikipediaSearchTool>('wikipediaSearch');
  
  if (!searchTool || !wikiTool) {
    console.error('Required tools not found in registry');
    return;
  }
  
  // Demo web search
  console.log('\n--- Web Search Demo ---');
  const searchResults = await searchTool.search('climate change solutions', { maxResults: 3 });
  console.log(`Found ${searchResults.length} results for "climate change solutions"`);
  searchResults.forEach((result, i) => {
    console.log(`${i+1}. ${result.title}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Description: ${result.description.substring(0, 100)}...`);
  });
  
  // Demo information extraction
  console.log('\n--- Information Extraction Demo ---');
  const facts = searchTool.extractInformation(searchResults, 'facts');
  console.log(`Extracted ${facts.length} facts:`);
  facts.forEach((fact, i) => console.log(`${i+1}. ${fact}`));
  
  // Demo Wikipedia search
  console.log('\n--- Wikipedia Search Demo ---');
  const wikiResults = await wikiTool.search('artificial intelligence');
  console.log(`Found ${wikiResults.length} Wikipedia articles for "artificial intelligence"`);
  
  if (wikiResults.length > 0) {
    console.log('\n--- Wikipedia Article Demo ---');
    const article = await wikiTool.getArticle(wikiResults[0].title, { extractLength: 300 });
    console.log(`Article: ${article?.title}`);
    console.log(`Summary: ${article?.extract}`);
  }
}

async function demoAgents() {
  console.log('\n=== AGENTS DEMO ===');
  
  // Create research agent
  const researchAgent = new ResearchAgent();
  
  // Perform basic research
  console.log('\n--- Basic Research Demo ---');
  const basicResearch = await researchAgent.research({
    topic: 'renewable energy',
    depth: 'basic',
    sources: ['both']
  });
  
  console.log(`Research on: ${basicResearch.topic}`);
  console.log(`Summary: ${basicResearch.summary}`);
  console.log(`Facts found: ${basicResearch.facts.length}`);
  console.log(`Sources: ${basicResearch.sources.length}`);
  
  // Perform detailed research
  console.log('\n--- Detailed Research Demo ---');
  const detailedResearch = await researchAgent.research({
    topic: 'quantum computing',
    infoTypes: ['facts', 'definitions', 'tutorials'],
    depth: 'detailed',
    sources: ['both']
  });
  
  console.log(`Research on: ${detailedResearch.topic}`);
  console.log(`Summary: ${detailedResearch.summary.substring(0, 200)}...`);
  console.log(`Facts found: ${detailedResearch.facts.length}`);
  console.log(`Definitions found: ${detailedResearch.definitions.length}`);
  console.log(`Tutorials found: ${detailedResearch.tutorials?.length || 0}`);
  console.log(`Sources: ${detailedResearch.sources.length}`);
}

async function runDemo() {
  try {
    console.log('Starting AI Library Demo...\n');
    
    // Demo tools
    await demoTools();
    
    // Demo agents
    await demoAgents();
    
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('Error running demo:', error);
  }
}

// Run the demo
runDemo();

export {};