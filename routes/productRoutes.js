
const express = require('express');
const { getProducts, scrapeProducts, deleteProducts } = require('../controllers/productController');

const router = express.Router();

router.get('/products', getProducts);          // Fetch all products
router.post('/scrape', scrapeProducts); // Scrape products
router.delete('/products', deleteProducts);     // Delete all products

module.exports = router;
