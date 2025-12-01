const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 80;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to fetch data from the remote site
app.get('/fetch-data', async (req, res) => {
  try {
    const response = await axios.get('https://example.com/api/data'); // Replace with the target URL
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
