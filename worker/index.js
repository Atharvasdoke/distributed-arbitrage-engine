const cron = require('node-cron');
const { chromium } = require('playwright');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load Protobuf
const PROTO_PATH = path.join(__dirname, '../proto/arbitrage.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const arbitrageProto = grpc.loadPackageDefinition(packageDefinition).arbitrage;

// Connect to gRPC server
const client = new arbitrageProto.ArbitrageService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const DUMMY_SITES = [
  { id: 1, name: 'ShopA', url: 'https://example.com/shopa' },
  { id: 2, name: 'MarketB', url: 'https://example.com/marketb' },
  { id: 3, name: 'Z-Store', url: 'https://example.com/zstore' },
];

const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', sku: 'WH-1000XM4' },
  { id: 2, name: '4K Monitor', sku: 'DELL-U2720Q' },
];

async function scrapePrice(browser, siteUrl, sku) {
  // Mocking the scrape since these are dummy URLs
  // In a real scenario, we'd navigate and extract text
  // const page = await browser.newPage();
  // await page.goto(`${siteUrl}/product/${sku}`);
  // const priceText = await page.locator('.price').innerText();
  // return parseFloat(priceText.replace('$', ''));

  // Simulated variation
  const basePrice = sku === 'WH-1000XM4' ? 299.99 : 499.99;
  const variation = (Math.random() * 0.2) - 0.1; // +/- 10%
  return +(basePrice * (1 + variation)).toFixed(2);
}

async function runWorker() {
  console.log('Worker started scraping...');
  // We use headless: true in production, but leaving it as default (true)
  const browser = await chromium.launch();
  const pricesData = [];

  for (const product of PRODUCTS) {
    for (const site of DUMMY_SITES) {
      const price = await scrapePrice(browser, site.url, product.sku);
      pricesData.push({
        product_id: product.id,
        retailer_id: site.id,
        price: price,
        currency: 'USD',
      });
      console.log(`Scraped ${product.name} on ${site.name}: $${price}`);
    }
  }

  await browser.close();

  // Send to Core API via gRPC
  client.ReportPrice({ prices: pricesData }, (err, response) => {
    if (err) {
      console.error('Failed to send prices via gRPC:', err);
    } else {
      console.log('Successfully reported prices:', response.message);
    }
  });
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', () => {
  runWorker();
});

console.log('Worker service running. Scraping scheduled every 5 minutes.');
runWorker(); // run once immediately
