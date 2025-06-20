import { TemuAdapter } from '../integrations/suppliers/temu';
import { AmazonAdapter } from '../integrations/marketplaces/amazon';
import { SourcingAgent } from '../agents/product_research/sourcing_agent';
import { startMockServer, stopMockServer } from './mockServer';

describe('Temu to Amazon Integration', () => {
  let mockServer: any;

  beforeAll(() => {
    mockServer = startMockServer();
  });

  afterAll(() => {
    stopMockServer();
  });

  test('should find and list products', async () => {
    const temu = new TemuAdapter();
    temu.baseUrl = 'http://localhost:3000/v1';
    
    const amazon = new AmazonAdapter();
    const agent = new SourcingAgent(temu, amazon);

    const products = await agent.findProducts({
      keywords: ['wireless earbuds'],
      maxPrice: 20,
      minProfitMargin: 0.3
    });

    expect(products.length).toBeGreaterThan(0);
    
    const listing = amazon.prepareListing(products[0]);
    expect(listing).toHaveProperty('title');
    expect(listing).toHaveProperty('price');
  });
});