import express from 'express';
import { getPublicPower, getLastFullRow, newDate, newDateString } from './energyCharts.js'; // Import the function

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


// API endpoint to get the latest data
app.get('/api/graphdata', (req, res) => {
  // console.log(newDateString(1));
  // console.log(newDate(1));
  // console.log(latestData.unix_seconds[0]);
  if (latestData && row) {  
    const colors = [
      'rgba(31, 119, 180, 1)',
      'rgba(0, 255, 255, 1)',//
      'rgba(148, 103, 189, 1)',
      'rgba(140, 86, 75, 1)',
      'rgba(105, 105, 105, 1)',
      'rgba(227, 119, 194, 1)',
      'rgba(65, 105, 225, 1)',
      'rgba(34, 139, 34, 1)',
      'rgba(135, 206, 235, 1)',
      'rgba(191, 191, 0, 1)'
    ]
    const labels = ["Cross border electricity export", "Hydro pumped storage consumption",
      "Cross border electricity import", "Others", 
      "Fossil coal","Fossil oil and gas",
      "Hydro","Waste, Biomass and Geothermal","Wind","Solar"
    ]
    const xLabels = latestData.unix_seconds.map(ts => new Date(ts * 1000).toISOString().substring(0,16).replace("T"," "));
    const data = {
      labels: xLabels,
      datasets: 
        labels.map((element,index) => ({label: element,
            data: latestData["unix_seconds"].map(
                (el, idx) => latestData[element] ? [el,latestData[element][idx]] : [el, null]
            ),
            borderColor: colors[index],
            backgroundColor: colors[index],
            fill: true})
        )
        // [{
      //   label: labels[0],
      //   data: latestData["unix_seconds"].map(
      //       (element, index) => [element,latestData["Wind"][index]]
      //   ),
      //   borderColor: colors[0],
      //   backgroundColor: colors[0],
      //   fill: true
      // },
      // {
      //   label: labels[1],
      //   data: latestData["unix_seconds"].map(
      //       (element, index) => [element,latestData["Solar"][index]]
      //   ),
      //   borderColor: colors[1],
      //   backgroundColor: colors[1],
      //   fill: true
      // }]
    };
    // data.datasets.forEach(element => {element.data = latestData["unix_seconds"].map(
    //       (el, idx) => console.log(latestData[element.label][0])//[el,latestData[element.label][idx]]
    //   );})
    console.log(data);
    res.json(data);
  } else {
    res.status(503).send("No data available yet.");
  }
});
app.get('/api/piedata', (req, res) => {
  const colors = [
    'rgba(49, 163, 84, 1)',
    'rgba(65, 105, 225, 1)',
    'rgba(34, 139, 34, 1)',
    'rgba(135, 206, 235, 1)',
    'rgba(212, 212, 0, 1)',//
    'rgba(230, 85, 13, 1)',
    'rgba(140, 86, 75, 1)',//
    'rgba(117, 107, 177, 1)',
    'rgba(148, 103, 189, 1)',//
    'rgba(99, 99, 99, 1)',
    'rgba(105, 105, 105, 1)',
    'rgba(227, 119, 194, 1)'//
  ]
  if (latestData && row) {
    const chartData = {
      labels: ["Renewables", "Hydro", "Waste, Biomass and Geothermal", "Wind", "Solar",
              "Other", "Other",
              "Cross border electricity import", "Cross border electricity import",
              "Fossil", "Fossil coal", "Fossil oil and gas"],
      datasets: [{
        data: [
          [
            row["Hydro"],
            row["Waste, Biomass and Geothermal"],
            row["Wind"],
            row["Solar"]
          ].reduce((a,b)=>a+b),0,0,0,0,
          row["Others"],0,
          row["Cross border electricity import"],0,
          [
            row["Fossil coal"],
            row["Fossil oil and gas"]
          ].reduce((a,b)=>a+b),0,0
        ],
        backgroundColor: colors,
        weight: 1
      },
      {
        data: [
          0,
          row["Hydro"],
          row["Waste, Biomass and Geothermal"],
          row["Wind"],
          row["Solar"],
          0,
          row["Others"],
          0,
          row["Cross border electricity import"],
          0,
          row["Fossil coal"],
          row["Fossil oil and gas"]
        ],
        backgroundColor: colors,
        weight: 0.67
      }]
    };
    console.log(chartData);
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
