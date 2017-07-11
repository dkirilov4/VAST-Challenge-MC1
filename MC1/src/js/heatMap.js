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
    var svgContainer;
    var gContainer;
    var heatMap;

    var margin = { top: 50, right: 100, bottom: 50, left: 50 };
    
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
        if (d.NumReadings == 0)
            return "white"
        else
            return colorScale(d.NumReadings);
    }

    self.createHeatMap = function()
    {
        console.log(">> Creating Heat Map...");

        var minEntries = getMinEntries();
        var maxEntries = getMaxEntries();

        // colorScale = d3.scaleLinear()
        //         .domain([minEntries, maxEntries * (1/3), maxEntries * (2/3), maxEntries])
        //         .range(["#9cffaa", "#00ff0d", "#fbff14", "#cf0000"]);

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/4), maxEntries * (2/4), maxEntries * (3/4), maxEntries])
                .range(["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"]);

        svgContainer = d3.select(".heatMapDiv").append("svg")
                                .attr("width", width)
                                .attr("height", height)
                                //.attr("viewBox", "0 0 " + (numRows * cellSize) + " " + (numCols * cellSize));

        gContainer = svgContainer.append("g")
                                .attr("class", "heatMap")
                                .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

        heatMap = gContainer.selectAll(".dayGroup")
                            .data(dailyData).enter()
                            .append("g")
                            .attr("class", "dayGroup")
                            .attr("transform", function(d) {return "translate(" + cellSize * d.Day + ", 0)"})
                            .each(function(d)
                            {
                                d3.select(this).selectAll(".bin")
                                    .data(d.SensorData)
                                    .enter()
                                    .append("rect")
                                    .attr("class", "bin")
                                    .attr("transform", function(d) {return "translate(0, " + gateData.indexOf(d.Gate) * cellSize + ")"})
                                    .attr("width", cellSize)
                                    .attr("height", cellSize)
                                    .attr("fill", function(d) { return getBinColor(d) })
                                    .on("mouseover", function(x) { d3.select("." + x.Gate).attr("fill", "green")})
                                    .on("mouseout", function(x) { d3.select("." + x.Gate).attr("fill", "white")})
                                    .append("title")
                                    .text(function(x) { return "Date: " + d.Date + "\nLocation: " + x.Gate + "\nEntries: " + x.NumReadings})
                            })
                            .on("contextmenu", function(d) { createZoomedHeatMap(d)})

        var rowLabels = gContainer.append("g")
                                    .attr("class", "rowLabels")
                                    .selectAll(".rowLabel")
                                    .data(gateData)
                                    .enter()
                                    .append("text")
                                    .attr("class", function(d) { return d} )
                                    .text(function(d) { return d; })
                                    .attr("x", -90)
                                    .attr("y", function(d, i) { return i * cellSize + cellSize})
                                    .style("text-anchor", "start")
                                    .attr("fill", "white")

        var zoom = d3.zoom()
            .scaleExtent([1, 50])
            .on("zoom", function()
            {
                console.log("Zooming / Panning")

                var width = document.getElementsByClassName("heatMapDiv")[0].clientWidth;
                var height = document.getElementsByClassName("heatMapDiv")[0].clientHeight;
                
                var tx = Math.min(0, Math.max(d3.event.transform.x, width - width * d3.event.transform.k));
                var ty = Math.min(0, Math.max(d3.event.transform.y, height - height * d3.event.transform.k));

                console.log("TX: " + tx)
                console.log("TY: " + ty)

                //gContainer.attr('transform', 'translate(' + tx + ',' + ty + ') scale(' + d3.event.transform.k + ')');
                 gContainer.attr("transform", d3.event.transform);
            })

        gContainer.call(zoom)
    }

    function createZoomedHeatMap(dayData)
    {        
        d3.event.preventDefault();
        d3.selectAll(".dayGroup").remove();

        var minEntries = Infinity;
        var maxEntries = 0;

        var numGates = dayData.SensorData.length;
        var timeSteps = 24;

        for (var i = 0; i < numGates; i++)
        {
            for (var j = 0; j < timeSteps; j++)
            {
                var curValue = dayData.SensorData[i].Timestamps[j];

                if (curValue < minEntries)
                    minEntries = curValue;

                if (curValue > maxEntries)
                    maxEntries = curValue;
            }
        }

        console.log(dayData);

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/4), maxEntries * (2/4), maxEntries * (3/4), maxEntries])
                .range(["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"]);

        heatMap = gContainer.selectAll(".hourGroup")
                            .data(dayData.SensorData).enter()
                            .append("g")
                            .attr("class", "hourGroup")
                            .attr("transform", function(d, i) {return "translate(0, " + i * cellSize + ")"})
                            .each(function(d)
                            {
                                d3.select(this).selectAll(".hourlyBin")
                                    .data(d.Timestamps)
                                    .enter()
                                    .append("rect")
                                    .attr("class", "hourlyBin")
                                    .attr("transform", function(d, i) { return "translate(" + i * cellSize + ", 0)"})
                                    .attr("width", cellSize)
                                    .attr("height", cellSize)
                                    .on("mouseover", function(x) { d3.select("." + d.Gate).attr("fill", "green")})
                                    .on("mouseout", function(x) { d3.select("." + d.Gate).attr("fill", "white")})
                                    .attr("fill", function(d) { return (colorScale(d)) })
                                    .append("title")
                                    .text(function(x, i) { return "Gate: " + d.Gate + "\nHour: " + i + "\nPeople: " + x})
                            })

        console.log("Done");

        // heatMap = gContainer.selectAll(".dayGroup")
        //                     .data(dayData).enter()
        //                     .append("g")
        //                     .attr("class", "hourGroup")
        //                     .attr("transform", function(d) {return "translate(" + cellSize * d.Day + ", 0)"})
        //                     .each(function(d)
        //                     {
        //                         d3.select(this).selectAll(".bin")
        //                             .data(d.SensorData)
        //                             .enter()
        //                             .append("rect")
        //                             .attr("class", "bin")
        //                             .attr("transform", function(d) {return "translate(0, " + gateData.indexOf(d.Gate) * cellSize + ")"})
        //                             .attr("width", cellSize)
        //                             .attr("height", cellSize)
        //                             .attr("fill", function(d) { return getBinColor(d) })
        //                             .append("title")
        //                             .text(function(x) { return "Date: " + d.Date + "\nLocation: " + x.Gate + "\nEntries: " + x.NumReadings});
        //                     })

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