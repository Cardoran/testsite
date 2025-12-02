const { DateTime } = require('luxon');
const axios = require('axios');

// Function to fetch and process data
export async function getPublicPower(country = "de", start = "2025-03-16 00:00", end = "2025-03-20 22:00") {
    const url = `https://api.energy-charts.info/public_power?country=${country}&start=${start}&end=${end}`;
    console.log(`Fetching data from ${url}...`);

    try {
        const response = await axios.get(url);
        if (response.status === 404) {
            throw new Error("404: API endpoint not found");
        }

        const data = response.data;
        const time = data.unix_seconds.map(timestamp => DateTime.fromSeconds(timestamp).toJSDate());

        const dataDict = { unix_seconds: time };
        data.production_types.forEach(type => {
            dataDict[type.name] = type.data;
        });

        // Calculate derived columns
        dataDict["Cross border electricity export"] = dataDict["Cross border electricity trading"].map(x => x < 0 ? x : 0);
        dataDict["Cross border electricity import"] = dataDict["Cross border electricity trading"].map(x => x > 0 ? x : 0);

        const sumArrays = (arrays) => arrays[0].map((_, i) => arrays.reduce((sum, arr) => sum + (arr[i] || 0), 0));

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

        return dataDict;
    } catch (error) {
        console.error(`Error fetching data: ${error.message}`);
        throw error;
    }
}

export function getLastFullRow(df) {
    let i = df.unix_seconds.length - 1; // Start from the last row
    while (true) {
        const row = {};
        // Extract the row as an object
        Object.keys(df).forEach(key => {
            row[key] = df[key][i];
        });

        // Check for NaN in specified columns
        const testColumns = [
            "Hydro", "Waste, Biomass and Geothermal", "Wind", "Solar",
            "Fossil coal", "Fossil oil and gas",
            "Hydro pumped storage consumption",
            "Cross border electricity trading",
            "Others", "Renewable share of generation"
        ];

        const testVals = testColumns.map(col => row[col]);
        const hasNaN = testVals.some(val => isNaN(val) || val === null || val === undefined);

        if (hasNaN) {
            console.log(`NaN found @ ${row.unix_seconds}`);
            i--;
            if (i < 0) {
                throw new Error("No valid row found (all rows contain NaN).");
            }
        } else {
            console.log(testVals);
            testVals.unix_seconds = row.unix_seconds;
            console.log(testVals);
            return testVals; // Return the valid row
        }
    }
}