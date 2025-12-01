const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 80;

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to fetch data from a remote site
app.get('/fetch-data', async (req, res) => { const dummyData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [{
      data: [30, 20, 15, 25, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };
  res.json(dummyData);

//   try {
//     const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1'); //'https://example.com/api/data'  //'https://jsonplaceholder.typicode.com/posts/1'
//     console.log('Fetched data:', response.data); // Log the data to the console
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching data:', error.message);
//     res.status(500).json({ error: 'Failed to fetch data' });
//   }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});