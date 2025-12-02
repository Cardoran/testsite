import express from 'express';
import { getPublicPower, getLastFullRow } from './energyCharts.js'; // Import the function

// Global variable to store the latest data
let latestData = null;
let row = null;

// Function to update the latest data
async function updateLatestData() {
    try {
        latestData = await getPublicPower(); // Use the imported function
        row = getLastFullRow(latestData);
        console.log("Data updated successfully.");
    } catch (error) {
        console.error("Failed to update data:", error.message);
    }
}

// Initialize Express.js server
const app = express();
const PORT = 80;

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static('public'));

// Endpoint to fetch dummy pie chart data
app.get('/pie-chart-data', (req, res) => {
  const dummyData = {
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
  console.log(getPublicPower());
  res.json(dummyData);
});

// API endpoint to get the latest data
app.get('/api/data', (req, res) => {
    if (latestData && row) {
        res.json(row);
    } else {
        res.status(503).send("No data available yet.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    // Update data immediately
    updateLatestData();

    // Update data every 10 seconds
    setInterval(updateLatestData, 10000);
});
