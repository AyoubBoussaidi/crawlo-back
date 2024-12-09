const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use('/', productRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to remote MongoDB'))
.catch((error) => console.error('Error connecting to remote MongoDB:', error.message));

app.get('/', (req, res) => {
  res.send('Welcome to the Amazon Product Scraper API!');
}); 

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
