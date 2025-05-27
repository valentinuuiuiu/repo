import * as http from 'http';

const mockServer = http.createServer((req, res) => {
  if (req.url === '/search' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        products: [{
          product_id: 'temu_123',
          product_name: 'Wireless Earbuds',
          price: 15.99,
          shipping_cost: 2.99,
          rating: 4.5,
          main_image: 'https://example.com/earbuds.jpg'
        }]
      }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

export function startMockServer(port = 3000) {
  mockServer.listen(port);
  console.log(`Mock server running on port ${port}`);
  return mockServer;
}

export function stopMockServer() {
  mockServer.close();
}