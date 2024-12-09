const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  type: { type: String, required: false },
  duration: { type: String, required: false }
});

const productSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: false },
  ratingCount: { type: String, required: false },
  freeShipping: { type: String, required: false },
  offers: [{
    priceOffer: { type: String, required: false },
    availability: { type: String, required: false },
    shippings: [shippingSchema]
  }],
  rating: { type: String, required: false },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
