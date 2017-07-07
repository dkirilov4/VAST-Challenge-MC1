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

    var nodeData = [];

    var vehicleData = [];


    //
    /* Visualizations */
    //

    self.createVis = function()
    {
        console.log(vehicleData);

        var lessThanHour = []; // 0 - 3600
        var lessThanDay  = []; // 0 - 86400
        var lessThanWeek = []; // 0 - 604800
        var lessThanMonth = []; // 0 - 2628000
        var lessThanHalfYear = []; // 0 - 15770000
        var lessThanYear = []; // 31540000

        for (var carID in vehicleData)
        {
            if (vehicleData[carID].TimeSpent < 3600)
                lessThanHour.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 86400)
                lessThanDay.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 604800)
                lessThanWeek.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 2628000)
                lessThanMonth.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 15770000)
                lessThanHalfYear.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 31540000)
                lessThanYear.push(vehicleData[carID])
        }

        console.log("< Hour:");
        console.log(lessThanHour)
        console.log("< Day:");
        console.log(lessThanDay)
        console.log("< Week:");
        console.log(lessThanWeek)
        console.log("< Month:");
        console.log(lessThanMonth)
        console.log("< 1/2 Year:");
        console.log(lessThanHalfYear)
        console.log("< Year:");
        console.log(lessThanYear)

        //self.createHeatMap();
        //self.createNodeMap();
        //self.createTreeMap();
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
        nodeMap.createNodeMap(rawData, dailyData, gateNames, gateData, nodeData, vehicleData);
    }

    self.createTreeMap = function()
    {
        var treeMap = new TreeMap();
        treeMap.createTreeMap(vehicleData);
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
            self.loadDailyData();
            self.loadGateData();

            self.createVis();
        })
    };

    // Create an array for each gate's readings
    var createEmptyGatesArray = function()
    {
        var emptyGates = [];

        for (var i = 0; i < gateNames.length; i++)
            emptyGates.push({Gate: gateNames[i], CarTypes: [], CarIDs: [], NumReadings: 0})

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
                            dailyData[j].SensorData[k].CarIDs.push(rawData[i].CarID);
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
                vehicleData[rawData[i].CarID] = {CarID: rawData[i].CarID, CarType: rawData[i].CarType, TimeSpent: -1, Locations: []};

                var newLocation = {Timestamp: rawData[i].Timestamp, GateName: rawData[i].GateName, Points: {X: 0, Y: 0}};                for (var j = 0; j < nodeData.length; j++)
                {
                    if (rawData[i].GateName == nodeData[j].id)
                    {
                        newLocation.Points.X = nodeData[j].x;
                        newLocation.Points.Y = nodeData[j].y;
                    }
                }

                vehicleData[rawData[i].CarID].Locations.push(newLocation);
            }
            else
            {
                var newLocation = {Timestamp: rawData[i].Timestamp, GateName: rawData[i].GateName, Points: {X: 0, Y: 0}};
                for (var j = 0; j < nodeData.length; j++)
                {
                    if (rawData[i].GateName == nodeData[j].id)
                    {
                        newLocation.Points.X = nodeData[j].x;
                        newLocation.Points.Y = nodeData[j].y;
                    }
                }

                vehicleData[rawData[i].CarID].Locations.push(newLocation)
            }
        }

        for (var carID in vehicleData)
        {
            var locLength = vehicleData[carID].Locations.length

            var startDate = new Date(vehicleData[carID].Locations[0].Timestamp)
            var endDate   = new Date(vehicleData[carID].Locations[locLength - 1].Timestamp)

            var curDate = endDate - startDate;
            vehicleData[carID].TimeSpent = curDate / 1000;
        }

        var newVehicleData = [];
        var i = 0;
        for (var carID in vehicleData)
        {
            newVehicleData.push(vehicleData[carID]);
            i++;
            if (i > 1000)
                break;
        }

        //vehicleData = newVehicleData;
    }


    //
    /* Publicly Available Functions: */
    //
    
    var publiclyAvailable = 
    {
        // Load all necessary data
        initialize: function(file)
        {
            nodeData = 
            [
                {id: "entrance0", x: 193, y: 33},
                {id: "entrance1", x: 57, y: 195},
                {id: "entrance2", x: 558, y: 258},
                {id: "entrance3", x: 353, y: 499},
                {id: "entrance4", x: 429, y: 551},
                {id: "general-gate0", x: 339, y: 17},
                {id: "general-gate1", x: 198, y: 69},
                {id: "general-gate2", x: 321, y: 91},
                {id: "general-gate3", x: 566, y: 161},
                {id: "general-gate4", x: 214, y: 292},
                {id: "general-gate5", x: 381, y: 328},
                {id: "general-gate6", x: 415, y: 410},
                {id: "general-gate7", x: 202, y: 431},
                {id: "ranger-stop0", x: 272, y: 43},
                {id: "ranger-stop1", x: 64, y: 69},
                {id: "ranger-stop2", x: 248, y: 96},
                {id: "ranger-stop3", x: 453, y: 132},
                {id: "ranger-stop4", x: 60, y: 284},
                {id: "ranger-stop5", x: 462, y: 352},
                {id: "ranger-stop6", x: 373, y: 443},
                {id: "ranger-stop7", x: 306, y: 445},
                {id: "camping0", x: 163, y: 120},
                {id: "camping1", x: 396, y: 147},
                {id: "camping2", x: 137, y: 186},
                {id: "camping3", x: 143, y: 204},
                {id: "camping4", x: 151, y: 266},
                {id: "camping5", x: 68, y: 360},
                {id: "camping6", x: 457, y: 530},
                {id: "camping7", x: 553, y: 433},
                {id: "camping8", x: 560, y: 142},
                {id: "gate0", x: 195, y: 93},
                {id: "gate1", x: 180, y: 129},
                {id: "gate2", x: 91, y: 157},
                {id: "gate3", x: 455, y: 178},
                {id: "gate4", x: 502, y: 340},
                {id: "gate5", x: 400, y: 435},
                {id: "gate6", x: 356, y: 453},
                {id: "gate7", x: 298, y: 479},
                {id: "gate8", x: 423, y: 541},
                {id: "ranger-base", x: 394, y: 525}
            ]

            self.loadData(file)
        },
    };

    return publiclyAvailable;
};