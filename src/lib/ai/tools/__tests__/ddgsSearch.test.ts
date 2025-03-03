import { DDGSSearchTool } from '../ddgsSearch';

// This is a simple test file to verify the DDGS search tool works
async function testDDGSSearch() {
  console.log('Testing DDGS Search Tool...');
  
  const searchTool = new DDGSSearchTool();
  
  try {
    // Test a simple search query
    const query = 'dropshipping platform benefits';
    console.log(`Searching for: "${query}"`);
    
    const results = await searchTool.search(query, { maxResults: 3 });
    
    console.log('Search Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Test information extraction
    if (results.length > 0) {
      console.log('\nExtracting facts:');
      const facts = searchTool.extractInformation(results, 'facts');
      console.log(facts);
    }
    
    return results;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDDGSSearch()
    .then(() => console.log('Test completed successfully'))
    .catch(err => console.error('Test failed:', err));
}

export { testDDGSSearch };