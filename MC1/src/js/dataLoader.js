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
    var orderedGateNames = [];

    var gateData = [];

    var nodeData = [];

    var vehicleData = [];


    //
    /* Visualizations */
    //

    self.createVis = function()
    {
        // var weekDayOrderedDailyData = [];
        var weekDays = [0, 1, 2, 3, 4, 5, 6];
        // console.log(weekDayOrderedDailyData)


        dailyData.sort(function(a, b)
        {
            var formatDay = d3.timeFormat("%w");

            var dateA = new Date(a.Date);
            var dateB = new Date(b.Date);

            var dayA = formatDay(dateA)
            var dayB = formatDay(dateB)

            if (dayA == 0)
                dayA = 7;
            if (dayB == 0)
                dayB = 7;
            
            if (dayA == dayB)
            {
                if (dateA.getTime() < dateB.getTime())
                    return -1;
                else if (dateA.getTime() > dateB.getTime())
                    return 1;
            }

            return dayA - dayB
        })

        for (var j = 0;j < dailyData.length;j++)
        {
            dailyData[j].DayWeek = j+1;
        }

        console.log(dailyData)

        self.createHeatMap();
        // self.createHistogram();

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

    self.createHistogram = function()
    {
        var histogram = new Histogram();
        histogram.createHistogram(vehicleData);
    }

    self.createSecondHistogram = function()
    {
        var gateHistogram = new GateHistogram();
        gateHistogram.createHistogram(vehicleData);
    }


    //
    /* Data Loading Functions */
    //

    // Loads all the data from the .csv file
    self.loadData = function(file)
    {
        console.log(">> Loading Data...");

        gateNames = [ "entrance0", "entrance1", "entrance2" , "entrance3" , "entrance4" , "general-gate0", "general-gate1" , "general-gate2" , "general-gate3" , "general-gate4" , "general-gate5" , "general-gate6" , "general-gate7" , "ranger-stop0" , "ranger-stop1" , "ranger-stop2" , "ranger-stop3" , "ranger-stop4" , "ranger-stop5" , "ranger-stop6" , "ranger-stop7" , "camping0" , "camping1" , "camping2" , "camping3" , "camping4" , "camping5" , "camping6" , "camping7" , "camping8" , "gate0" , "gate1" , "gate2" , "gate3" , "gate4" , "gate5" , "gate6" , "gate7" , "gate8" , "ranger-base" ];
        orderedGateNames = ["entrance3", "entrance2", "entrance4", "entrance0", "entrance1", "general-gate7", "general-gate2", "general-gate1", "general-gate4", "general-gate5", "general-gate6", "general-gate3", "general-gate0", "ranger-stop0", "ranger-stop2", "ranger-stop6", "ranger-stop3", "ranger-stop5", "ranger-stop7", "ranger-stop4", "ranger-stop1", "camping8", "camping5", "camping4", "camping6", "camping3", "camping2", "camping7", "camping0", "camping1", "gate8" , "gate5" , "gate3" , "gate6" , "gate4" , "gate7" , "gate2" , "gate1", "gate0", "ranger-base"];
        console.log(orderedGateNames)

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

    var createEmptyTimestampsArray = function()
    {
        var emptyTimestamps = [];
        for (var i = 0; i < 24; i++)
        {
            emptyTimestamps[i] = 0;
        }

        return emptyTimestamps;
    }

    // Create an array for each gate's readings
    var createEmptyGatesArray = function()
    {
        var emptyGates = [];
        
        for (var i = 0; i < gateNames.length; i++)
            emptyGates.push({Gate: gateNames[i], CarTypes: [], CarIDs: [], Timestamps: createEmptyTimestampsArray(), NumReadings: 0})

        return emptyGates;
    }

    var createOrderedEmptyGatesArray = function()
    {
        var emptyGates = [];
        
        for (var i = 0; i < orderedGateNames.length; i++)
            emptyGates.push({Gate: orderedGateNames[i], CarTypes: [], CarIDs: [], Timestamps: createEmptyTimestampsArray(), NumReadings: 0})

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
                var orderedEmptyGates = createOrderedEmptyGatesArray();
                dailyData.push({ Date: curDate, Day: curDay, SensorData: emptyGates, OrderedSensorData: orderedEmptyGates });
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
                            var formatHour = d3.timeFormat("%H");
                            var hour = parseInt(formatHour(new Date(rawData[i].Timestamp)));

                            dailyData[j].SensorData[k].Timestamps[hour]++;

                            dailyData[j].SensorData[k].CarIDs.push(rawData[i].CarID);
                            dailyData[j].SensorData[k].CarTypes.push(rawData[i].CarType);
                            dailyData[j].SensorData[k].NumReadings++;
                        }
                    }

                    for (var k = 0; k < dailyData[j].OrderedSensorData.length; k++)
                    {
                        if (dailyData[j].OrderedSensorData[k].Gate == rawData[i].GateName)
                        {
                            var formatHour = d3.timeFormat("%H");
                            var hour = parseInt(formatHour(new Date(rawData[i].Timestamp)));

                            dailyData[j].OrderedSensorData[k].Timestamps[hour]++;

                            dailyData[j].OrderedSensorData[k].CarIDs.push(rawData[i].CarID);
                            dailyData[j].OrderedSensorData[k].CarTypes.push(rawData[i].CarType);
                            dailyData[j].OrderedSensorData[k].NumReadings++;
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
                var orderedEmptyGates = createOrderedEmptyGatesArray();
                dailyData.push({ Date: curDate, Day: curDay, SensorData: emptyGates, OrderedSensorData: orderedEmptyGates });
            }

            dateExists = false;
        }


        dailyData.forEach(function (element) {
        var count = 0;
        for(var i = 0; i < 40; i++)
        {
            count +=  element.SensorData[i].NumReadings;}
            // console.log(count);
            element.TotalDay = count;
        });

        dailyData.sort(function(a, b){return b.TotalDay - a.TotalDay});

        for (var j = 0;j < dailyData.length;j++)
        dailyData[j].DayBusy = j+1;
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