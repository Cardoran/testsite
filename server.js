const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 80;
const { DateTime } = require('luxon');

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

async function getPublicPower(country = "de", start = "2025-03-16 00:00", end = "2025-03-20 22:00") {
    const url = `https://api.energy-charts.info/public_power?country=${country}&start=${start}&end=${end}`;
    console.log(url);

    let response;
    try {
        response = await axios.get(url);
        if (response.status === 404) {
            throw new Error("404: API endpoint not found");
        }
    } catch (error) {
        throw new Error(`Failed to fetch data: ${error.message}`);
    }

    const data = response.data;
    const time = data.unix_seconds.map(timestamp => DateTime.fromSeconds(timestamp).toJSDate());

    // Initialize the dictionary
    const dataDict = { unix_seconds: time };
    data.production_types.forEach(type => {
        dataDict[type.name] = type.data;
    });

    // Calculate derived columns
    dataDict["Cross border electricity export"] = dataDict["Cross border electricity trading"].map(x => x < 0 ? x : 0);
    dataDict["Cross border electricity import"] = dataDict["Cross border electricity trading"].map(x => x > 0 ? x : 0);

    // Sum arrays element-wise
    const sumArrays = (arrays) => arrays[0].map((_, i) => arrays.reduce((sum, arr) => sum + arr[i], 0));

    dataDict["Fossil oil and gas"] = sumArrays([
        dataDict["Fossil gas"],
        dataDict["Fossil coal-derived gas"],
        dataDict["Fossil oil"]
    ]);

    dataDict["Fossil coal"] = sumArrays([
        dataDict["Fossil brown coal / lignite"],
        dataDict["Fossil hard coal"]
    ]);

    dataDict["Hydro"] = sumArrays([
        dataDict["Hydro Run-of-River"],
        dataDict["Hydro water reservoir"],
        dataDict["Hydro pumped storage"]
    ]);

    dataDict["Wind"] = sumArrays([
        dataDict["Wind onshore"],
        dataDict["Wind offshore"]
    ]);

    dataDict["Waste, Biomass and Geothermal"] = sumArrays([
        dataDict["Biomass"],
        dataDict["Waste"],
        dataDict["Geothermal"]
    ]);
    console.log(dataDict);
    return dataDict;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
