"use strict";

/* Get or create the application global variable */
var App = App || {};

var SensorAnalysis = function()
{
    // setup the pointer to the scope 'this' variable
    var self = this;

    // data container
    var rawData = [];
    var sensorData = [];
    var dailyData = [];
    // all the sensor locations 
    var sensorReadings = [];
    var gateNames = [];


    self.preprocessData = function()
    {
        var createEmptyGatesArray = function()
        {
            var emptyGates = [];

            for (var i = 0; i < gateNames.length; i++)
                emptyGates.push({Gate: gateNames[i], NumReadings: 0})

            return emptyGates;
        }

        // Daily Data:
        var dateExists = false;
        for (var i = 0; i < rawData.length; i++)
        {
            // Get date format without hh:mm:ss timestamp
            var dateFormat = d3.timeFormat("%x"); //mm.dd.yyyy
            var curDate = dateFormat(new Date(rawData[i].Timestamp));

            // Push first element of Raw Data
            if (dailyData.length == 0) {
                var emptyGates = createEmptyGatesArray();
                dailyData.push({ Date: curDate, SensorData: emptyGates });
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
                var emptyGates = createEmptyGatesArray();
                dailyData.push({ Date: curDate, SensorData: emptyGates });
            }

            dateExists = false;
        }
    }

    self.createHeatMap = function()
    {
        var getMinEntries = function()
        {
            var minEntries = Infinity;

            for (var i = 0; i < dailyData.length; i++)
            {
                for (var j = 0; j < dailyData[i].SensorData.length; j++)
                {
                    if (dailyData[i].SensorData[j].NumReadings < minEntries)
                        minEntries = dailyData[i].SensorData[j].NumReadings;
                }
            }

            return minEntries;
        }

        var getMaxEntries = function()
        {
            var maxEntries = 0;

            for (var i = 0; i < dailyData.length; i++)
            {
                for (var j = 0; j < dailyData[i].SensorData.length; j++)
                {
                    if (dailyData[i].SensorData[j].NumReadings > maxEntries)
                        maxEntries = dailyData[i].SensorData[j].NumReadings;
                }
            }

            return maxEntries;
        }
        console.log(">> Creating Heat Map...");

        console.log(dailyData[5].SensorData[0]);
        console.log(dailyData[200].SensorData[0]);

        var minVisitors = getMinEntries();
        var maxVisitors = getMaxEntries();

        var cellSize = 12;
        var numCols = 40, numRows = 396;

        var MARGIN = { TOP: 50, RIGHT: 10, BOTTOM: 50, LEFT: 50};
        
        var HEIGHT = cellSize * numCols;
        var WIDTH = cellSize * numRows;

        var svg = d3.select("body").append("svg")
                    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
                    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
                    .append("g")
                    .attr("transform", "translate(" + MARGIN.RIGHT + "," + MARGIN.TOP + ")");

        var colorScale = d3.scaleLinear()
                        .domain([minVisitors, maxVisitors * (1/3), maxVisitors * (2/3), maxVisitors])
                        .range(["#9cffaa", "#00ff0d", "#fbff14", "#cf0000"]);
        
        var heatMap = svg.append("g")
                        .attr("class", "heatMap")
                        .selectAll(".cell")
                        .data(rawData, function(d) { return d; })
                        .enter()
                        .append("rect")
                        .classed("bin", true)
                        .attr("y", function(d) { return gateNames.indexOf(d.GateName) * cellSize; })
                        .attr("x", function(d) 
                        { 
                            var formatDayNumber = d3.timeFormat("%j");
                            var formatYear = d3.timeFormat("%Y");

                            var year = parseInt(formatYear(new Date(d.Timestamp)));

                            if (year == 2015)
                            {
                                //console.log("2015");
                                var day = parseInt(formatDayNumber(new Date(d.Timestamp))) - 121;
                                return day * cellSize;
                            }
                            else
                            {
                                //console.log("2016");
                                var day = parseInt(formatDayNumber(new Date(d.Timestamp))) + 244;

                                return day * cellSize;
                            }
                        })
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .style("fill", function(d) 
                        {
                            var formatDate = d3.timeFormat("%x");

                            var thisTimestamp = formatDate(new Date(d.Timestamp)); // 5/1/2015
                            var thisGate = d.GateName;

                            var dayTimestamp = thisTimestamp;

                            for (var i = 0; i < dailyData.length; i++)
                            {
                                if (thisTimestamp == dailyData[i].Date)
                                {
                                    for (var j = 0; j < dailyData[i].SensorData.length; j++)
                                    {
                                        if (thisGate == dailyData[i].SensorData[j].Gate)
                                        {
                                            if (dailyData[i].SensorData[j].NumReadings == 0)
                                                return "white"
                                            else
                                                return colorScale(dailyData[i].SensorData[j].NumReadings);
                                        }
                                    }
                                }
                            }
                        })
                        .append("title")
                        .text(function(d) {
                            var timestamp = d.Timestamp;
                            var gate = d.GateName;
                            var id = d.CarID;
                            var type = d.CarType;

                            return ("Timestamp: " + timestamp + "\nGate: " + gate + "\nCarID: " + id + "\nCarType: " + type );
                        });

    }

   self.createNodeMap = function()
    {
        var MARGIN = { TOP: 50, RIGHT: 10, BOTTOM: 50, LEFT: 50};

        var canvas = document.querySelector("canvas"),
            context = canvas.getContext("2d"),
            width = canvas.width,
            height = canvas.height;

        var image = new Image;
        image.src = "data/Lekagul Roadways labeled v2.jpg";

        image.onload = loaded;

        function loaded() {
            context.scale(.621, .621);
            context.drawImage(this, 0, 0);
        }
        
        //Make an SVG Container
        var svgContainer = d3.select("body").append("svg")
                                            .attr("width", canvas.width)
                                            .attr("height", canvas.height)
                                            .attr("transform", "translate(0, -1000)")
        
        //Draw the Circle
        var circle = svgContainer.append("circle")
                                 .attr("cx", 193)
                                 .attr("cy", 43)
                                 .attr("r", 20)
                                 .attr("fill", "red");
    }

    self.loadData = function(file)
    {
        console.log(">> Loading Data...");
        d3.csv(file)
            .row(function(d) 
            {
                // Raw Data: 
                rawData.push 
                ({
                    GateName: d["gate-name"],
                    Timestamp: d["Timestamp"],
                    CarID: d["car-id"],
                    CarType: d["car-type"]
                })

                // Sensor Data:
                for (var i = 0; i < sensorData.length; i++)
                {
                    if (sensorData[i].GateName == d["gate-name"])
                    {
                        sensorData[i].sensorReadings.push 
                        ({
                            Timestamp: d["Timestamp"],
                            CarID: d["car-id"],
                            CarType: d["car-type"]
                        });
                    }
                }

            })
            
            
            .get(function() {
                console.log("   Loaded " + rawData.length + " rows of data.");
                self.preprocessData();
                //self.createHeatMap();
                self.createNodeMap();
                console.log("Done");
            });
    };
    // publicly available functions
    var publiclyAvailable = {

        // load the data and setup the system
        initialize: function(file)
        {
            gateNames =  
            [
                "entrance0", "entrance1", "entrance2" , "entrance3" , "entrance4" , 
                "general-gate0" , "general-gate1" , "general-gate2" , "general-gate3" , "general-gate4" , "general-gate5" , "general-gate6" , "general-gate7" , 
                "ranger-stop0" , "ranger-stop1" , "ranger-stop2" , "ranger-stop3" , "ranger-stop4" , "ranger-stop5" , "ranger-stop6" , "ranger-stop7" , 
                "camping0" , "camping1" , "camping2" , "camping3" , "camping4" , "camping5" , "camping6" , "camping7" , "camping8" , 
                "gate0" , "gate1" , "gate2" , "gate3" , "gate4" , "gate5" , "gate6" , "gate7" , "gate8" , 
                "ranger-base" 
            ];

            for (var i = 0; i < gateNames.length; i++)
            {
                var newSensor = {GateName: gateNames[i], sensorReadings: [] };

                sensorData.push(newSensor);
            }

            self.loadData(file);
        },
    };

    return publiclyAvailable;
};