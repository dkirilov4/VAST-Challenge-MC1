"use strict";

var App = App || {};

var DataLoader = function()
{
    var self = this;
    
    //
    /* Global Scope Variables: */
    //

    // Data Containers:
    var rawData = [];       // Format: {Timestamp, CarID, CarType, GateName}

    var dailyData = [];     // Format: { Date, SensorData: {Gate, CarType[]} }
    
    var gateNames = [];

    var gateData = [];

    var vehicleData = [];


    //
    /* Visualizations */
    //

    self.createVis = function()
    {
        self.createHeatMap();
        //self.createNodeMap();
        console.log(gateData)
    }

    //
    // Visualization Functions:
    //

    self.createHeatMap = function()
    {
        var heatMap = new HeatMap();
        heatMap.createHeatMap(rawData, dailyData, gateNames);
    }

    self.createNodeMap = function()
    {
        var nodeMap = new NodeMap();
        nodeMap.createNodeMap(rawData, dailyData, gateNames, gateData);
    }


    //
    /* Data Loading Functions */
    //

    // Loads all the data from the .csv file
    self.loadData = function(file)
    {
        console.log(">> Loading Data...");

        gateNames = [ "entrance0", "entrance1", "entrance2" , "entrance3" , "entrance4" , "general-gate0" , "general-gate1" , "general-gate2" , "general-gate3" , "general-gate4" , "general-gate5" , "general-gate6" , "general-gate7" , "ranger-stop0" , "ranger-stop1" , "ranger-stop2" , "ranger-stop3" , "ranger-stop4" , "ranger-stop5" , "ranger-stop6" , "ranger-stop7" , "camping0" , "camping1" , "camping2" , "camping3" , "camping4" , "camping5" , "camping6" , "camping7" , "camping8" , "gate0" , "gate1" , "gate2" , "gate3" , "gate4" , "gate5" , "gate6" , "gate7" , "gate8" , "ranger-base" ];

        d3.csv(file).row(function(d)
        {
            rawData.push 
            ({
                GateName: d["gate-name"],
                Timestamp: d["Timestamp"],
                CarID: d["car-id"],
                CarType: d["car-type"]
            })
        })
        .get(function()
        {
            self.loadVehicleData();
            console.log(Object.keys(vehicleData))
            // self.loadDailyData();
            // self.loadGateData();
            // self.createVis();
        })
    };

    // Create an array for each gate's readings
    var createEmptyGatesArray = function()
    {
        var emptyGates = [];

        for (var i = 0; i < gateNames.length; i++)
            emptyGates.push({Gate: gateNames[i], CarTypes: [], NumReadings: 0})

        return emptyGates;
    }

    // Processes all the raw data into a format organized by day
    self.loadDailyData = function()
    {
        // Daily Data:
        var curDay = 1;
        var dateExists = false;
        for (var i = 0; i < rawData.length; i++)
        {
            // Get date format without hh:mm:ss timestamp
            var dateFormat = d3.timeFormat("%x"); //mm.dd.yyyy
            var curDate = dateFormat(new Date(rawData[i].Timestamp));

            // Push first element of Raw Data
            if (dailyData.length == 0) {
                var emptyGates = createEmptyGatesArray();
                dailyData.push({ Date: curDate, Day: curDay, SensorData: emptyGates });
                dateExists = true;
            }

            // Check if the current date being read already exists in the dailyData array
            for (var j = 0; j < dailyData.length; j++)
            {
                if (curDate == dailyData[j].Date) 
                {
                    // If the date exists, increment the correct sensor's readings for the corresponding day
                    for (var k = 0; k < dailyData[j].SensorData.length; k++)
                    {
                        if (dailyData[j].SensorData[k].Gate == rawData[i].GateName)
                        {
                            dailyData[j].SensorData[k].CarTypes.push(rawData[i].CarType);
                            dailyData[j].SensorData[k].NumReadings++;
                        }
                    }
                    // Since we have found the corresponding day, break so we don't keep looping
                    dateExists = true;
                    break;
                }
            }

            // If date isn't in the dailyData array, add it
            if (!dateExists) 
            {
                curDay++;
                var emptyGates = createEmptyGatesArray();
                dailyData.push({ Date: curDate, Day: curDay, SensorData: emptyGates });
            }

            dateExists = false;
        }
    }

    self.loadGateData = function()
    {
        var emptyGates = [];

        for (var i = 0; i < gateNames.length; i++)
            emptyGates[gateNames[i]] = {DailyData: {}}

        for (var i = 0; i < rawData.length; i++)
        {
            var dateFormat = d3.timeFormat("%x"); // formats timestamp to: mm/dd/yyyy
            var curDate = dateFormat(new Date(rawData[i].Timestamp));

            if (!emptyGates[rawData[i].GateName].DailyData[curDate]) {
                emptyGates[rawData[i].GateName].DailyData[curDate] = [];
                emptyGates[rawData[i].GateName].DailyData[curDate].push({CarID: rawData[i].CarID, CarType: rawData[i].CarType})
            }
            else
            {
                emptyGates[rawData[i].GateName].DailyData[curDate].push({CarID: rawData[i].CarID, CarType: rawData[i].CarType})
            }
        }

        gateData = emptyGates;
    }

    self.loadVehicleData = function()
    {
        for (var i = 0; i < rawData.length; i++)
        {
            if (!vehicleData[rawData[i].CarID])
            {
                vehicleData[rawData[i].CarID] = {CarID: rawData[i].CarID, CarType: rawData[i].CarType, Locations: []};
                vehicleData[rawData[i].CarID].Locations.push({GateName: rawData[i].GateName, Timestamp: rawData[i].Timestamp})
            }
            else
            {
                vehicleData[rawData[i].CarID].Locations.push({GateName: rawData[i].GateName, Timestamp: rawData[i].Timestamp})
            }
        }
    }


    //
    /* Publicly Available Functions: */
    //
    
    var publiclyAvailable = 
    {
        // Load all necessary data
        initialize: function(file)
        {
            self.loadData(file)
        },
    };

    return publiclyAvailable;
};