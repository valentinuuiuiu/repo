


import { CustomerServiceAgent } from '../../CustomerServiceAgent';
import { InventoryAgent } from '../../InventoryAgent';
import { mockPublish, mockSubscribe } from '../../__mocks__/messageBus';
import { testAgentConfig } from '../testConfig';

describe('Agent Collaboration', () => {
  let customerAgent: CustomerServiceAgent;
  let inventoryAgent: InventoryAgent;

  beforeEach(() => {
    customerAgent = new CustomerServiceAgent();
    inventoryAgent = new InventoryAgent();
    mockPublish.mockClear();
    mockSubscribe.mockClear();
  });

  test('should coordinate inventory check for shipping inquiry', async () => {
    mockSubscribe.mockImplementation((topic, handler) => {
      if (topic === 'inventory-check') {
        handler({ inStock: true, quantity: 5 });
      }
      return Promise.resolve();
    });

    const response = await customerAgent.handleInquiry(
      'Is Product X in stock?',
      { id: 'cust-123', name: 'Test Customer' }
    );

    expect(response.data).toMatchObject({
      inStock: true,
      availableQuantity: 5
    });
    expect(mockPublish).toHaveBeenCalledWith(
      'inventory-check',
      expect.objectContaining({ product: 'Product X' })
    );
  });
});


