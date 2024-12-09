
const puppeteer = require('puppeteer');
const Product = require('../models/product');

// Fetch all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Scrape and save products
const scrapeProducts = async (req, res) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const baseURL = 'https://www.amazon.es/s?rh=n%3A15424901031';
  const products = [];
  const pagesToScrape = 2;

  for (let i = 1; i <= pagesToScrape; i++) {
    const url = `${baseURL}&page=${i}`;
    console.log("url : ",url)
    await page.goto(url, { waitUntil: 'load', timeout: 0 });

    await page.waitForSelector('.s-main-slot');

    const pageProducts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.s-main-slot .s-result-item'))
        .filter(item => item.querySelector('h2'))
        .map(item => {
          const name = item.querySelector('h2')?.innerText.trim() || 'Unknown';
          const url = item.querySelector('h2 a')?.href || 'URL not found';
          const image = item.querySelector('img')?.src || 'Image not available';
          const priceText = item.querySelector('.a-price .a-offscreen')?.innerText.trim() || null;
          const priceOfferText = item.querySelector('.a-size-base .a-color-base')?.innerText.trim() || null;
          const availability = item.querySelector('.a-color-success')?.innerText.trim() || 'Availability unknown';
          const deliveryTime = item.querySelector('.s-align-children-center span')?.innerText.trim() || 'Delivery time unknown';
          const rating = item.querySelector('.a-icon-alt')?.innerText.trim() || 'Rating not available';
          const ratingCount = item.querySelector('.a-size-base')?.innerText.trim() || 'Rating count not available';
          const freeShipping = item.querySelector('.a-color-base.a-text-bold')?.innerText.trim() || 'No free shipping info';
          
          const price = priceText ? parseFloat(priceText.replace(/[^\d,.]/g, '').replace(',', '.')) : 'Not Available';
          const priceOffer = priceOfferText ? parseFloat(priceOfferText.replace(/[^\d,.]/g, '').replace(',', '.')) : 'Not Available';
          return {
            url: url.replace(/^https:\/\/www.amazon.es/, ''),
            name,
            price,
            ratingCount,
            image,
            freeShipping,
            offers: [
              {
                priceOffer,
                availability: availability === 'Availability unknown' ? 'OutOfStock' : 'InStock',
                shippings: [
                  {
                    type: 'sendToHome',
                    duration: deliveryTime
                  }
                ]
              }
            ],
            rating
          };
        });
    });
    products.push(...pageProducts);
  }

  const maxProducts = 30;
  const limitedProducts = products.slice(1, maxProducts + 1);

  try {
    await Product.insertMany(limitedProducts);
    res.status(200).json({ message: 'Products scraped and saved to database.' });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred during scraping process.', error: error.message });
  }

  await browser.close();
};

// Delete all products
const deleteProducts = async (req, res) => {
  try {
    await Product.deleteMany(); // Deletes all documents in the collection
    res.status(200).json({ message: 'All products deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error occurred while deleting products.', error: error.message });
  }
};

module.exports = {
  getProducts,
  scrapeProducts,
  deleteProducts,
};
