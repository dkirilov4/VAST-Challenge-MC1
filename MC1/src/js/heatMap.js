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

    var colorScale;

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

    var getDayNumber = function(d)
    {
        var formatDayNumber = d3.timeFormat("%j");
        var formatYear = d3.timeFormat("%Y");

        var year = parseInt(formatYear(new Date(d.Timestamp)));

        if (year == 2015)
        {
            var day = parseInt(formatDayNumber(new Date(d.Timestamp))) - 121;
            return day;
        }
        else
        {
            var day = parseInt(formatDayNumber(new Date(d.Timestamp))) + 244;
            return day;
        }
    }

    var getBinColor = function(d)
    {
        var formatDate = d3.timeFormat("%x"); // Format: "5/1/2015"

        var thisTimestamp = formatDate(new Date(d.Timestamp)); 
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
    }

    self.createHeatMap = function()
    {
        console.log(">> Creating Heat Map...");

        var minEntries = getMinEntries();
        var maxEntries = getMaxEntries();

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/3), maxEntries * (2/3), maxEntries])
                .range(["#9cffaa", "#00ff0d", "#fbff14", "#cf0000"]);

        console.log("Here!");

        var svgContainer = d3.select(".heatMapDiv").append("svg")
                                .attr("width", width + margin.left + margin.right)
                                .attr("height", height + margin.top + margin.bottom)

        var gContainer = svgContainer.append("g")
                                .attr("class", "heatMap")
                                .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

        var heatMap = gContainer.selectAll(".bin")
                            .data(rawData).enter()
                            .append("rect")
                            .attr("class", "bin")
                            .attr("x", function(d) { return getDayNumber(d) * cellSize; })
                            .attr("y", function(d) { return gateData.indexOf(d.GateName) * cellSize; })
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .attr("fill", function(d) { return getBinColor(d); });

        var binTitles = heatMap.data(rawData).enter()
                            .append("title")
                            .text(function(d) { return ("Timestamp: " + d.Timestamp + "\nGate: " + d.GateName + "\nCarID: " + d.CarID + "\nCarType: " + d.CarType ); })
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