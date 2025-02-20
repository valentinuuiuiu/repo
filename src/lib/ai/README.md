# AI Agents System for E-commerce Platform

## Overview
This system provides a multi-agent AI architecture for e-commerce operations, featuring:
- Department-specific AI agents
- Hierarchical task management
- Human-in-the-loop review system
- Vector database integration (ChromaDB)
- Natural Language Processing capabilities

## Installation

```bash
# Install required dependencies
npm install chromadb langchain @xenova/transformers

# Set up environment variables
echo "VITE_OPENAI_API_KEY=your_key_here" >> .env
```

## Usage

### 1. UI Interface

Access the AI system through the UI at `/ai/tasks`. The interface provides:

```typescript
// Submit a new task
const task = {
  type: 'product_optimization',
  departments: ['product', 'marketing'],
  data: {
    productId: '123',
    context: 'Optimize pricing and description'
  }
};

// Review and approve/reject tasks
const feedback = {
  comments: 'Looks good',
  modifications: { price: 29.99 }
};
```

### 2. Terminal Usage

```bash
# Start the ChromaDB server
docker run -p 8000:8000 chromadb/chroma

# Run NLP pipeline
npm run nlp-process
```

### 3. Programmatic Usage

```typescript
import { aiService } from '@/lib/ai';
import { ChromaClient } from 'chromadb';

// Initialize ChromaDB
const chroma = new ChromaClient();
const collection = await chroma.createCollection('products');

// Store product embeddings
await collection.add({
  ids: ['product1'],
  embeddings: productEmbedding,
  metadatas: [{ title: 'Product 1' }]
});

// Execute AI task with vector search
const result = await aiService.executeTask({
  type: 'product_optimization',
  departments: ['product', 'marketing'],
  data: {
    product: productData,
    similarProducts: await collection.query({
      queryEmbeddings: productEmbedding,
      nResults: 5
    })
  }
});
```

## Agent Types

1. **Product Agent**
   - Price optimization
   - Description enhancement
   - Tag suggestions

2. **Marketing Agent**
   - Strategy creation
   - Ad optimization
   - Campaign analysis

3. **Inventory Agent**
   - Demand prediction
   - Stock optimization
   - Reorder planning

4. **Supplier Agent**
   - Performance analysis
   - Reliability prediction
   - Improvement suggestions

5. **Customer Service Agent**
   - Inquiry handling
   - Satisfaction analysis
   - Support optimization

## Vector Database Integration

```typescript
// Store product information
const collection = await chroma.createCollection('products');

// Add embeddings
await collection.add({
  ids: productIds,
  embeddings: embeddings,
  metadatas: productMetadata
});

// Query similar products
const similar = await collection.query({
  queryEmbeddings: targetEmbedding,
  nResults: 5
});
```

## NLP Capabilities

```typescript
import { pipeline } from '@xenova/transformers';

// Sentiment analysis
const sentiment = await pipeline('sentiment-analysis');
const result = await sentiment('Great product!');

// Text classification
const classifier = await pipeline('text-classification');
const category = await classifier('Product description...');

// Named Entity Recognition
const ner = await pipeline('ner');
const entities = await ner('Product features...');
```

## Task Types

```typescript
type TaskType =
  | 'product_optimization'
  | 'product_launch'
  | 'marketing_strategy'
  | 'inventory_forecast'
  | 'supplier_evaluation'
  | 'customer_inquiry';
```

## Human-in-the-Loop

1. Submit task through UI or API
2. AI agents process and provide recommendations
3. Human review interface shows results
4. Approve/reject with feedback
5. System learns from feedback

## Data Storage

- Vector embeddings stored in ChromaDB
- Task history and feedback stored in database
- Agent insights and recommendations cached

## Best Practices

1. Always provide comprehensive task data
2. Include relevant departments for better insights
3. Review AI recommendations before implementation
4. Provide detailed feedback for system improvement
5. Regular retraining of embeddings

## Error Handling

```typescript
try {
  const result = await aiService.executeTask(task);
} catch (error) {
  console.error('Task execution failed:', error);
  // Implement fallback logic
}
```

## Monitoring

- Agent status monitoring through UI
- Task success rate tracking
- Performance metrics dashboard
- Error logging and alerts

## Security

- API key protection
- Rate limiting
- Access control per department
- Audit logging
