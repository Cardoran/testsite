import { DateTime } from 'luxon';
import axios from 'axios';

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
        const time = data.unix_seconds;//.map(timestamp => DateTime.fromSeconds(timestamp).toJSDate());

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

        // console.log(dataDict);
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
            // console.log(`NaN found @ ${row.unix_seconds}`);
            i--;
            if (i < 0) {
                throw new Error("No valid row found (all rows contain NaN).");
            }
        } else {
            // console.log(row);
            return row; // Return the valid row
        }
    }
}

export function get_emissions(df) {
    const emissions_per_type = {"Hydro":24,//wikipedia Life-cycle_greenhouse_gas_emissions_of_energy_sources
                    "Waste":329/2,//http://www.lak-energiebilanzen.de/methodik-der-co2-bilanzen/
                    "Biomass":230,//wikipedia
                    "Geothermal":38,//wiki
                    "Wind offshore":12,//wiki
                    "Wind onshore":11,//wiki
                    "Solar":48,//wiki
                    "Fossil brown coal / lignite":1073,//quaschning
                    "Fossil hard coal":970,//quaschning
                    "Fossil gas":436,//quaschning
                    "Fossil coal-derived gas":436,//no info, take fossil gas
                    "Fossil oil":265/0.4}//quaschning with 40% efficiency
    const emissions_total = 0;
    const total_energy = 0;
    for (const [key, value] of Object.entries(emissions_per_type)) {
        let key_energy = df[key];
        total_energy += key_energy;
        emissions_total += key_energy*value;
    }
    return emissions_total/total_energy
}