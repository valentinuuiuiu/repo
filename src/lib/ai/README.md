# AI Library

A comprehensive library for building AI-powered features in your applications.

## Overview

This library provides a collection of tools and agents that can be used to add AI capabilities to your applications. It includes:

- **Tools**: Low-level components that provide specific functionality (e.g., web search, Wikipedia access)
- **Agents**: Higher-level components that combine tools to perform complex tasks (e.g., research, content generation)
- **Registry**: A central registry for managing and accessing tools

## Getting Started

```typescript
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
console.log(`Found ${research.facts.length} facts and ${research.sources.length} sources`);
```

## Available Tools

### DuckDuckGo Search Tool

Search the web using DuckDuckGo's API and extract specific types of information from search results.

```typescript
import { toolRegistry } from 'lib/ai';
import type { DDGSSearchTool } from 'lib/ai';

const searchTool = toolRegistry.getTool<DDGSSearchTool>('ddgsSearch');
const results = await searchTool.search('climate change solutions');

// Extract facts from search results
const facts = searchTool.extractInformation(results, 'facts');
```

### Wikipedia Search Tool

Search Wikipedia and extract structured information from articles.

```typescript
import { toolRegistry } from 'lib/ai';
import type { WikipediaSearchTool } from 'lib/ai';

const wikiTool = toolRegistry.getTool<WikipediaSearchTool>('wikipediaSearch');

// Search for articles
const searchResults = await wikiTool.search('artificial intelligence');

// Get full article details
const article = await wikiTool.getArticle('Artificial intelligence', {
  getSections: true,
  getCategories: true
});

// Get just a summary
const summary = await wikiTool.getSummary('Machine learning');
```

## Available Agents

### Research Agent

An agent specialized in gathering and synthesizing information from multiple sources.

```typescript
import { ResearchAgent } from 'lib/ai';

const agent = new ResearchAgent();

// Basic research
const basicResults = await agent.research({
  topic: 'renewable energy',
  depth: 'basic'
});

// Comprehensive research with specific information types
const detailedResults = await agent.research({
  topic: 'quantum computing',
  infoTypes: ['facts', 'definitions', 'tutorials'],
  depth: 'comprehensive',
  sources: ['both'],
  maxResults: 15
});
```

## Tool Registry

The tool registry provides a central place to access all available tools.

```typescript
import { toolRegistry } from 'lib/ai';

// Get a specific tool
const searchTool = toolRegistry.getTool('ddgsSearch');

// Get all tools in a category
const searchTools = toolRegistry.getToolsByCategory('search');

// Get metadata about a tool
const metadata = toolRegistry.getToolMetadata('wikipediaSearch');
```

## Examples

Check out the examples directory for more detailed examples of how to use the library:

- `aiLibraryDemo.ts`: Demonstrates basic usage of tools and agents

## Extending the Library

You can add your own tools and agents to the library:

### Adding a New Tool

1. Create a new tool class in the `src/lib/ai/tools` directory
2. Register the tool in the `toolRegistry.ts` file
3. Export the tool in the `index.ts` file

### Adding a New Agent

1. Create a new agent class in the `src/lib/ai/agents` directory
2. Export the agent in the `index.ts` file

## License

MIT