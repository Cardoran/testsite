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
    const chartData = {
      labels: ["Renewables","Solar","Wind","Other","Hydro","Other","Import","Fossil"],
      datasets: [{
        data: [
          [
            row["Hydro"],
            row["Waste, Biomass and Geothermal"],
            row["Wind"],
            row["Solar"]
          ].reduce((a,b)=>a+b),
          row["Others"],
          row["Cross border electricity import"],
          [
            row["Fossil coal"],
            row["Fossil oil and gas"]
          ].reduce((a,b)=>a+b)
        ],
        backgroundColor: [
          'rgba(49, 163, 84, 1)',
          'rgba(230, 85, 13, 1)',
          'rgba(117, 107, 177, 1)',
          'rgba(99, 99, 9, 1)'
        ],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        weight: [2,1,1,1]
      },
      {
        data: [
          row["Hydro"],
          row["Waste, Biomass and Geothermal"],
          row["Wind"],
          row["Solar"],
          row["Others"],
          row["Cross border electricity import"],
          row["Fossil coal"],
          row["Fossil oil and gas"]
        ],
        backgroundColor: [
          'rgba(65, 105, 225, 1)',
          'rgba(34, 139, 34, 1)',
          'rgba(135, 206, 235, 1)',
          'rgba(140, 86, 75, 1)',
          'rgba(148, 103, 189, 1)',
          'rgba(105, 105, 105, 1)',
          'rgba(227, 119, 194, 1)'
        ],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1
      }]
    };
    res.json(chartData);
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
