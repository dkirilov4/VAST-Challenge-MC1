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

    var cellSize = 3;
    var miniCellSize = 12;

    var colorScale;

    // SVG Properties:
    var svgContainer;
    var zoomedSvgContainer;
    var heatMap;
    var rowLabels; 
    var colLabels;

    var gContainer;
    var zoomedGContainer;
    var miniColLabels;

    var margin = { top: 40, right: 20, bottom: 40, left: 20 };
    
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
                                .attr("height", height + margin.bottom + margin.top)
                                //.attr("viewBox", "0 0 " + (numRows * cellSize) + " " + (numCols * cellSize));

        gContainer = svgContainer.append("g")
                                .attr("class", "heatMap")
                                .attr("transform", "translate(" + margin.right + "," + margin.top + ")");

        zoomedSvgContainer = d3.select(".miniHeatMapDiv").append("svg")
                                .attr("width", 24 * miniCellSize)
                                .attr("height", 40 * miniCellSize + margin.bottom + margin.top)

        zoomedGContainer = zoomedSvgContainer.append("g")
                                .attr("class", "miniHeatMap")
                                .attr("transform", "translate(" + 0 + "," + margin.top + ")");

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
                                    .on("mouseover", function(x) 
                                    { 
                                        d3.select("." + x.Gate).attr("fill", "green")
                                        var selectedDate = "._" + d.Date.replace(/\//g, "_")
                                        d3.select(selectedDate).attr("fill", "green")
                                    })
                                    .on("mouseout", function(x) 
                                    { 
                                        d3.select("." + x.Gate).attr("fill", "white")
                                        d3.select("._" + d.Date.replace(/\//g, "_")).attr("fill", "white")
                                    })
                                    .append("title")
                                    .text(function(x) { return "Date: " + d.Date + "\nLocation: " + x.Gate + "\nEntries: " + x.NumReadings})
                            })
                            .on("contextmenu", function(d) 
                            { 
                                d3.event.preventDefault();
                                createZoomedHeatMap(d)})

        rowLabels = gContainer.append("g")
                                    .attr("class", "rowLabels")
                                    .selectAll(".rowLabel")
                                    .data(gateData)
                                    .enter()
                                    .append("text")
                                    .attr("class", function(d) { return d} )
                                    .text(function(d) { return d; })
                                    .attr("x", -16)
                                    .attr("y", function(d, i) { return i * cellSize + cellSize})
                                    .style("text-anchor", "start")
                                    .attr("fill", "white")
                                    .attr("font-size", "2px")

        console.log(dailyData);
        colLabels = gContainer.append("g")
                                .attr("class", "colLabels")
                                .selectAll(".colLabel")
                                .data(dailyData)
                                .enter()
                                .append("text")
                                .attr("class", function(d) { return "_" + d.Date.replace(/\//g, "_"); })
                                .text(function(d) { return d.Date; })
                                .attr("transform", "rotate(-90)")   // FIX ROTATION PER ELEMENT?
                                .attr("y", function(d) { return (d.Day * cellSize) + cellSize} )
                                .attr("x", 5)
                                .attr("fill", "white")
                                .attr("font-size", "2px")


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

                // gContainer.attr('transform', 'translate(' + tx + margin.right + ',' + ty + margin.top + ') scale(' + d3.event.transform.k + ')');
                gContainer.attr("transform", d3.event.transform);
            })

        gContainer.call(zoom)
    }

    function createZoomedHeatMap(dayData)
    {   
        d3.selectAll(".hourGroup").remove();

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

        heatMap = zoomedGContainer.selectAll(".hourGroup")
                            .data(dayData.SensorData).enter()
                            .append("g")
                            .attr("class", "hourGroup")
                            .attr("transform", function(d, i) {return "translate(0, " + i * miniCellSize + ")"})
                            .each(function(d)
                            {
                                d3.select(this).selectAll(".hourlyBin")
                                    .data(d.Timestamps)
                                    .enter()
                                    .append("rect")
                                    .attr("class", "hourlyBin")
                                    .attr("transform", function(d, i) { return "translate(" + i * miniCellSize + ", 0)"})
                                    .attr("width", miniCellSize)
                                    .attr("height", miniCellSize)
                                    .on("mouseover", function(x) { d3.select("." + d.Gate).attr("fill", "green")})
                                    .on("mouseout", function(x) { d3.select("." + d.Gate).attr("fill", "white")})
                                    .attr("fill", function(d) { return (colorScale(d)) })
                                    .append("title")
                                    .text(function(x, i) { return "Gate: " + d.Gate + "\nHour: " + i + "\nPeople: " + x})
                            })

        var hours = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
                     "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "24:00"]

        miniColLabels = zoomedSvgContainer.append("g")
                                .attr("class", "hourColLabels")
                                .selectAll(".hourColLabel")
                                .data(hours)
                                .enter()
                                .append("text")
                                // .attr("class", function(d) { return "_" + d.Date.replace(/:/g, "_"); })
                                .text(function(d) { return d; })
                                .attr("transform", "rotate(-90)")   // FIX ROTATION PER ELEMENT?
                                .attr("x",  (miniCellSize * (-3)))
                                .attr("y", function(d, i) { return (i * miniCellSize) + miniCellSize})
                                .attr("fill", "white")
                                .attr("font-size", "10px")

        // var zoom = d3.zoom()
        //     .scaleExtent([1, 50])
        //     .on("zoom", function()
        //     {
        //         console.log("Zooming / Panning")

        //         var width = document.getElementsByClassName("miniHeatMapDiv")[0].clientWidth;
        //         var height = document.getElementsByClassName("miniHeatMapDiv")[0].clientHeight;
                
        //         var tx = Math.min(0, Math.max(d3.event.transform.x, width - width * d3.event.transform.k));
        //         var ty = Math.min(0, Math.max(d3.event.transform.y, height - height * d3.event.transform.k));

        //         console.log("TX: " + tx)
        //         console.log("TY: " + ty)

        //         // gContainer.attr('transform', 'translate(' + tx + margin.right + ',' + ty + margin.top + ') scale(' + d3.event.transform.k + ')');
        //         zoomedGContainer.attr("transform", d3.event.transform);
        //     })

        // zoomedGContainer.call(zoom)

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
            createZoomedHeatMap(dailyData[100])
        },
    };

    return publiclyAvailable;
}