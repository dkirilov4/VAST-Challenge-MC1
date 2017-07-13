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
    var gateData = ["entrance3", "entrance2", "entrance4", "entrance0", "entrance1", "", "general-gate7", "general-gate2", "general-gate1", "general-gate4", "general-gate5", "general-gate6", "general-gate3", "general-gate0", "", "ranger-stop0", "ranger-stop2", "ranger-stop6", "ranger-stop3", "ranger-stop5", "ranger-stop7", "ranger-stop4", "ranger-stop1", "", "camping8", "camping5", "camping4", "camping6", "camping3", "camping2", "camping7", "camping0", "camping1","", "gate8" , "gate5" , "gate3" , "gate6" , "gate4" , "gate7" , "gate2" , "gate1", "gate0","", "ranger-base"];
    var orderedGateData = ["entrance3", "entrance2", "entrance4", "entrance0", "entrance1", "", "general-gate7", "general-gate2", "general-gate1", "general-gate4", "general-gate5", "general-gate6", "general-gate3", "general-gate0", "", "ranger-stop0", "ranger-stop2", "ranger-stop6", "ranger-stop3", "ranger-stop5", "ranger-stop7", "ranger-stop4", "ranger-stop1", "", "camping8", "camping5", "camping4", "camping6", "camping3", "camping2", "camping7", "camping0", "camping1","", "gate8" , "gate5" , "gate3" , "gate6" , "gate4" , "gate7" , "gate2" , "gate1", "gate0","", "ranger-base"];
    var busiestGates = [];

    //
    /* Heatmap: */
    //

    // Heatmap Properties:
    var numRows = 396;      // Number of Days
    var numCols = 40;       // Number of Gates

    var cellSize = 2.5;
    var miniCellSize = 10;

    var colorScale;

    // SVG Properties:
    var heatMap;

    var svgContainer;
    var zoomedSvgContainer;

    var gContainer;
    var zoomedGContainer;

    var rowLabels; 
    var colLabels;
    var miniColLabels;

    var mainLegend;
    var miniLegend;

    var minEntries;
    var maxEntries;
    var miniMinEntries;
    var miniMaxEntries;

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
        var minEntries = getMinEntries();
        var maxEntries = getMaxEntries();

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/8), maxEntries * (2/8), maxEntries * (3/8), maxEntries * (4/8), maxEntries * (5/8), maxEntries * (6/8), maxEntries * (7/8), maxEntries])
                .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

        if (d.NumReadings == 0)
            return "lightgrey"
        else
            return colorScale(d.NumReadings);
    }

    self.createSVGs = function()
    {
        minEntries = getMinEntries();
        maxEntries = getMaxEntries();

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/8), maxEntries * (2/8), maxEntries * (3/8), maxEntries * (4/8), maxEntries * (5/8), maxEntries * (6/8), maxEntries * (7/8), maxEntries])
                .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

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
    }

    self.createHeatMap = function()
    {
        console.log(">> Creating Heat Map...");

        var minEntries = getMinEntries();
        var maxEntries = getMaxEntries();

        heatMap = gContainer.selectAll(".dayGroup")
                            .data(dailyData).enter()
                            .append("g")
                            .attr("class", "dayGroup")
                            .attr("transform", function(d) 
                            {
                                var isBusiestDaysChecked = document.getElementById("busiestDaysCheckbox").checked
                                var isDayOfWeekChecked = document.getElementById("dayOfWeekCheckbox").checked

                                if (isBusiestDaysChecked)
                                    return "translate(" + cellSize * d.DayBusy + ", 0)"
                                else if (isDayOfWeekChecked)
                                    return "translate(" + cellSize * d.DayWeek + ", 0)"
                                else
                                    return "translate(" + cellSize * d.Day + ", 0)"
                            })
                            .each(function(d)
                            {
                                d3.select(this).selectAll(".bin")
                                    .data(function() {
                                        var checked = document.getElementById("busiestSensorsCheckbox").checked

                                        if (checked)
                                            return d.OrderedSensorData;
                                        else
                                            return d.SensorData;
                                    })
                                    .enter()
                                    .append("rect")
                                    .attr("class", "bin")
                                    .attr("transform", function(d) 
                                    {
                                        var checked = document.getElementById("busiestSensorsCheckbox").checked

                                        if (checked)
                                            return "translate(0, " + orderedGateData.indexOf(d.Gate) * cellSize + ")"
                                        else {
                                            //console.log(gateData.indexOf(d.Gate));
                                            return "translate(0, " + gateData.indexOf(d.Gate) * cellSize + ")"
                                        }
                                    })
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

        var numDays = dailyData.length;
        var numGates = dayData.SensorData.length;
        var timeSteps = 24;

        for (var i = 0; i < dailyData.length; i++)
        {
            for (var j = 0; j < numGates; j++)
            {
                for (var k = 0; k < timeSteps; k++)
                {
                    var curValue = dailyData[i].SensorData[j].Timestamps[k];

                    if (curValue < minEntries)
                        minEntries = curValue;
                    if (curValue > maxEntries)
                        maxEntries = curValue;
                }
            }
        }

        miniMinEntries = minEntries;
        miniMaxEntries = maxEntries;

        console.log("MIN: " + minEntries);
        console.log("MAX: " + maxEntries);

        colorScale = d3.scaleLinear()
                .domain([minEntries, maxEntries * (1/8), maxEntries * (2/8), maxEntries * (3/8), maxEntries * (4/8), maxEntries * (5/8), maxEntries * (6/8), maxEntries * (7/8), maxEntries])
                .range(["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]);

        heatMap = zoomedGContainer.selectAll(".hourGroup")
                            .data(dayData.SensorData)
                            .enter()
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
        console.log("Done");
    }

    self.createMainLegend = function()
    {
        var legendSVGContainer;
        var legendGContainer;
        var legendLabelGContainer;

        legendSVGContainer = d3.select(".heatMapDiv").insert("heatMapDiv", ":first-child").append("svg")                            
                            .attr("width", miniCellSize * 40)
                            .attr("height", miniCellSize * 4)
                            .attr("transform", "translate(" + 590 + "," + 0 + ")")

        legendGContainer = legendSVGContainer.append("g")
                                .attr("width", miniCellSize * 40)
                                .attr("height", miniCellSize)
                                .attr("transform", "translate(" + 0 + "," + miniCellSize * 3 + ")")
        
        legendLabelGContainer = legendSVGContainer.append("g")
                                .attr("width", miniCellSize * 40)
                                .attr("height", miniCellSize * 3)

        var defs = legendGContainer.append("defs");

        var mainLinearGradient = defs.append("linearGradient")
                                    .attr("id", "mainHeatMapLegendGradient")

        mainLinearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%")

        mainLinearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "lightgrey")

        mainLinearGradient.append("stop")
                .attr("offset", "10%")
                .attr("stop-color", "lightgrey")

        mainLinearGradient.append("stop")
                .attr("offset", "10%")
                .attr("stop-color", "#fff5f0")

        mainLinearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#67000d")

        legendGContainer.append('rect')
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", miniCellSize * 40)
                .attr("height", miniCellSize)
                .style("fill", "url(#mainHeatMapLegendGradient)");

        var upperBoundText = legendLabelGContainer.append("text")
                                .text("0")
                                .attr("transform", "translate(" + 0 + "," + miniCellSize * 2 + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")

        var lowerBoundText = legendLabelGContainer.append("text")
                                .text("1")
                                .attr("transform", "translate(" + miniCellSize * 4 + "," + miniCellSize * 2 + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")

        var zeroBoundText = legendLabelGContainer.append("text")
                                .text(function() { return maxEntries})
                                .attr("transform", "translate(" + miniCellSize * 38 + "," + miniCellSize * 2 + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")
    }

    document.getElementById("busiestSensorsCheckbox").addEventListener("change", filterHeatmap, false);
    document.getElementById("busiestDaysCheckbox").addEventListener("change", filterHeatmap, false);
    document.getElementById("dayOfWeekCheckbox").addEventListener("change", filterHeatmap, false);
    function filterHeatmap()
    {
        var checked = document.getElementById("busiestSensorsCheckbox").checked;

        // heatMap.remove();
        d3.selectAll(".dayGroup").remove();
        self.createHeatMap(); 
    }

    //
    self.createMiniLegend = function()
    {
        var legendSVGContainer;
        var legendGContainer;
        var legendLabelGContainer;

        legendSVGContainer = d3.select(".miniHeatMapDiv").append("svg")                            
                            .attr("width", miniCellSize * 4)
                            .attr("height", miniCellSize * 40)
                            .attr("transform", "translate(" + miniCellSize * 3 + "," + miniCellSize * -4 + ")")

        legendGContainer = legendSVGContainer.append("g")
                                .attr("width", miniCellSize)
                                .attr("height", miniCellSize * 40)
        
        legendLabelGContainer = legendSVGContainer.append("g")
                                .attr("width", miniCellSize*3)
                                .attr("height", miniCellSize * 40)

        var defs = legendGContainer.append("defs");

        var linearGradient = defs.append("linearGradient")
                                    .attr("id", "heatMapLegendGradient")

        linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")

        linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#67000d")

        linearGradient.append("stop")
                .attr("offset", "90%")
                .attr("stop-color", "#fff5f0")

        linearGradient.append("stop")
                .attr("offset", "90%")
                .attr("stop-color", "lightgrey")

        linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "lightgrey")

        legendGContainer.append('rect')
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", miniCellSize)
                .attr("height", miniCellSize * 40)
                .style("fill", "url(#heatMapLegendGradient)");

        var upperBoundText = legendLabelGContainer.append("text")
                                .text(function() { return miniMaxEntries})
                                .attr("transform", "translate(" + miniCellSize * 1.5 + "," + miniCellSize + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")

        var lowerBoundText = legendLabelGContainer.append("text")
                                .text("1")
                                .attr("transform", "translate(" + miniCellSize * 1.5 + "," + miniCellSize * 36 + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")

        var zeroBoundText = legendLabelGContainer.append("text")
                                .text("0")
                                .attr("transform", "translate(" + miniCellSize * 1.5 + "," + miniCellSize * 40 + ")")
                                .attr("font-size", "12px")
                                .attr("fill", "white")
    }

    document.getElementById("busiestSensorsCheckbox").addEventListener("change", filterHeatmap, false);
    document.getElementById("busiestDaysCheckbox").addEventListener("change", filterHeatmap, false);
    document.getElementById("dayOfWeekCheckbox").addEventListener("change", filterHeatmap, false);
    function filterHeatmap()
    {
        var checked = document.getElementById("busiestSensorsCheckbox").checked;

        // heatMap.remove();
        d3.selectAll(".dayGroup").remove();
        self.createHeatMap(); 
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
            // gateData = gData;
            // gateData = [ "entrance0", "entrance1", "entrance2" , "entrance3" , "entrance4" ,"", "general-gate0", "general-gate1" , "general-gate2" , "general-gate3" , "general-gate4" , "general-gate5" , "general-gate6" , "general-gate7" ,"", "ranger-stop0" , "ranger-stop1" , "ranger-stop2" , "ranger-stop3" , "ranger-stop4" , "ranger-stop5" , "ranger-stop6" , "ranger-stop7" ,"", "camping0" , "camping1" , "camping2" , "camping3" , "camping4" , "camping5" , "camping6" , "camping7" , "camping8" ,"", "gate0" , "gate1" , "gate2" , "gate3" , "gate4" , "gate5" , "gate6" , "gate7" , "gate8" ,"", "ranger-base" ];


            // self.loadFilters();
            self.createSVGs();
            self.createHeatMap();
            createZoomedHeatMap(dailyData[120])
            self.createMainLegend();
            self.createMiniLegend();
            
        },
    };

    return publiclyAvailable;
}