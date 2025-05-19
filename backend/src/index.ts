// Import required dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Root endpoint - Returns welcome message
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 