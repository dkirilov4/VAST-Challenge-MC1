"use strict";

var App = App || {};

var HeatMap = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

    // Data Containers:
    var rawData = [];
    var dailyData = [];
    var gateData = [];


    //
    /* Heatmap: */
    //

    // Heatmap Properties:
    var numRows = 396;      // Number of Days
    var numCols = 40;       // Number of Gates

    var cellSize = 12;

    // SVG Properties:
    var margin = { top: 50, right: 10, bottom: 50, left: 50 };
    
    var height = cellSize * numCols;
    var width = cellSize * numRows;

    
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

    self.createHeatMap = function()
    {
        console.log(">> Creating Heat Map...");
        var minEntries = getMinEntries();
        var maxEntries = getMaxEntries();
        var colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/3), maxEntries * (2/3), maxEntries])
                .range(["#9cffaa", "#00ff0d", "#fbff14", "#cf0000"]);

        var svg = d3.select("body").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.right + "," + margin.top + ")");


        var heatMap = svg.append("g")
                        .attr("class", "heatMap")
                        .selectAll(".cell")
                        .data(rawData, function(d) { return d; })
                        .enter()
                        .append("rect")
                        .classed("bin", true)
                        .attr("y", function(d) { return gateData.indexOf(d.GateName) * cellSize; })
                        .attr("x", function(d) 
                        { 
                            var formatDayNumber = d3.timeFormat("%j");
                            var formatYear = d3.timeFormat("%Y");

                            var year = parseInt(formatYear(new Date(d.Timestamp)));

                            if (year == 2015)
                            {
                                var day = parseInt(formatDayNumber(new Date(d.Timestamp))) - 121;
                                return day * cellSize;
                            }
                            else
                            {
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




    //
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createHeatMap: function(rData, dData, gData)
        {
            rawData = rData;
            dailyData = dData;
            gateData = gData;

            self.createHeatMap();
        },
    };

    return publiclyAvailable;
}