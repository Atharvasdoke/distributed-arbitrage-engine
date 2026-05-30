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

const RETAILERS = [
  { id: 1, name: 'eBay', url: 'https://www.ebay.com' },
  { id: 2, name: 'Newegg', url: 'https://www.newegg.com' },
];

const PRODUCTS = [
  { id: 1, name: 'Sony PlayStation 5', sku: 'PlayStation 5 Console' },
  { id: 2, name: 'NVIDIA RTX 4090', sku: 'RTX 4090 Graphics Card' },
];

async function scrapeEbay(page, query) {
  try {
    await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0&LH_ItemCondition=1000&rt=nc&LH_BIN=1`, { waitUntil: 'domcontentloaded' });
    const priceText = await page.locator('.s-item__price').first().innerText();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    return price;
  } catch (e) {
    console.error(`Failed to scrape eBay for ${query}`);
    return null;
  }
}

async function scrapeNewegg(page, query) {
  try {
    await page.goto(`https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}&N=4814`, { waitUntil: 'domcontentloaded' });
    const priceText = await page.locator('.price-current').first().innerText();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    return price;
  } catch (e) {
    console.error(`Failed to scrape Newegg for ${query}`);
    return null;
  }
}

async function runWorker() {
  console.log('Real Playwright Worker starting...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  const pricesData = [];

  for (const product of PRODUCTS) {
    console.log(`Scraping ${product.name}...`);
    
    // Scrape eBay
    const ebayPrice = await scrapeEbay(page, product.sku);
    if (ebayPrice && !isNaN(ebayPrice)) {
      pricesData.push({
        product_id: product.id,
        retailer_id: 1, // eBay
        price: ebayPrice,
        currency: 'USD',
      });
      console.log(`[eBay] ${product.name}: $${ebayPrice}`);
    }

    // Scrape Newegg
    const neweggPrice = await scrapeNewegg(page, product.sku);
    if (neweggPrice && !isNaN(neweggPrice)) {
      pricesData.push({
        product_id: product.id,
        retailer_id: 2, // Newegg
        price: neweggPrice,
        currency: 'USD',
      });
      console.log(`[Newegg] ${product.name}: $${neweggPrice}`);
    }
  }

  await browser.close();

  if (pricesData.length > 0) {
    // Send to Core API via gRPC
    client.ReportPrice({ prices: pricesData }, (err, response) => {
      if (err) {
        console.error('Failed to send prices via gRPC:', err);
      } else {
        console.log('Successfully reported live scraped prices:', response.message);
      }
    });
  } else {
    console.log('No valid prices found during this scrape run.');
  }
}

// Run immediately, then every 2 minutes
console.log('Real web scraper service initialized.');
runWorker();
cron.schedule('*/2 * * * *', () => {
  runWorker();
});
