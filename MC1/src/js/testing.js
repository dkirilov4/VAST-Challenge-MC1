"use strict";

var App = App || {};

var Histogram = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

	var vehicleData = [];

    var lessThanHalfHour = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []};
    var lessThanHour = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 0 - 3600
    var lessThanDay  = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 0 - 86400
    var lessThanWeek = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 0 - 604800
    var lessThanMonth = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 0 - 2628000
    var lessThanHalfYear = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 0 - 15770000
    var lessThanYear = {AllVehicles: [], _1: [], _2: [], _3: [], _4: [], _5: [], _6: [], _2P: []}; // 31540000


    var binData = [];

    // SVG Properties
    var svgContainer;
    var svgMargin = { top: 50, left: 50, bottom: 50, right: 75 };
        
    var svgWidth = 960 - svgMargin.left - svgMargin.right;
    var svgHeight = 500 - svgMargin.top - svgMargin.bottom;

    // Zoom Out Button Properties
    var zoomOutButton;
    var buttonSize = 50;

    //
    /* Histogram */
    //
    self.populateBins = function()
    {
        for (var carID in vehicleData)
        {
            var carType = vehicleData[carID].CarType;

            if (vehicleData[carID].TimeSpent < 1800) 
            {
                lessThanHalfHour.AllVehicles.push(vehicleData[carID])

                if (carType == "1")
                    lessThanHalfHour._1.push(vehicleData[carID])
                else if (carType == "2")
                    lessThanHalfHour._2.push(vehicleData[carID])
                else if (carType == "3")
                    lessThanHalfHour._3.push(vehicleData[carID])
                else if (carType == "4")
                    lessThanHalfHour._4.push(vehicleData[carID])
                else if (carType == "5")
                    lessThanHalfHour._5.push(vehicleData[carID])
                else if (carType == "6")
                    lessThanHalfHour._6.push(vehicleData[carID])
                else if (carType == "2P")
                    lessThanHalfHour._2P.push(vehicleData[carID])

            }
            else if (vehicleData[carID].TimeSpent < 86400)
            {
                lessThanDay.AllVehicles.push(vehicleData[carID])

                if (carType == "1")
                    lessThanDay._1.push(vehicleData[carID])
                else if (carType == "2")
                    lessThanDay._2.push(vehicleData[carID])
                else if (carType == "3")
                    lessThanDay._3.push(vehicleData[carID])
                else if (carType == "4")
                    lessThanDay._4.push(vehicleData[carID])
                else if (carType == "5")
                    lessThanDay._5.push(vehicleData[carID])
                else if (carType == "6")
                    lessThanDay._6.push(vehicleData[carID])
                else if (carType == "2P")
                    lessThanDay._2P.push(vehicleData[carID])

            }
            else if (vehicleData[carID].TimeSpent < 604800)
            {
                lessThanWeek.AllVehicles.push(vehicleData[carID])

                if (carType == "1")
                    lessThanWeek._1.push(vehicleData[carID])
                else if (carType == "2")
                    lessThanWeek._2.push(vehicleData[carID])
                else if (carType == "3")
                    lessThanWeek._3.push(vehicleData[carID])
                else if (carType == "4")
                    lessThanWeek._4.push(vehicleData[carID])
                else if (carType == "5")
                    lessThanWeek._5.push(vehicleData[carID])
                else if (carType == "6")
                    lessThanWeek._6.push(vehicleData[carID])
                else if (carType == "2P")
                    lessThanWeek._2P.push(vehicleData[carID])

            }
            else if (vehicleData[carID].TimeSpent < 2628000)
            {
                lessThanMonth.AllVehicles.push(vehicleData[carID])

                if (carType == "1")
                    lessThanMonth._1.push(vehicleData[carID])
                else if (carType == "2")
                    lessThanMonth._2.push(vehicleData[carID])
                else if (carType == "3")
                    lessThanMonth._3.push(vehicleData[carID])
                else if (carType == "4")
                    lessThanMonth._4.push(vehicleData[carID])
                else if (carType == "5")
                    lessThanMonth._5.push(vehicleData[carID])
                else if (carType == "6")
                    lessThanMonth._6.push(vehicleData[carID])
                else if (carType == "2P")
                    lessThanMonth._2P.push(vehicleData[carID])
            }
            else
            {
                lessThanYear.AllVehicles.push(vehicleData[carID])

                if (carType == "1")
                    lessThanYear._1.push(vehicleData[carID])
                else if (carType == "2")
                    lessThanYear._2.push(vehicleData[carID])
                else if (carType == "3")
                    lessThanYear._3.push(vehicleData[carID])
                else if (carType == "4")
                    lessThanYear._4.push(vehicleData[carID])
                else if (carType == "5")
                    lessThanYear._5.push(vehicleData[carID])
                else if (carType == "6")
                    lessThanYear._6.push(vehicleData[carID])
                else if (carType == "2P")
                    lessThanYear._2P.push(vehicleData[carID])
            }
        }

        binData.push(lessThanHalfHour)
        binData.push(lessThanDay);
        binData.push(lessThanWeek);
        binData.push(lessThanMonth);
        binData.push(lessThanYear);

        console.log(binData)
    }

    self.createSVGs = function()
    {
        svgContainer = d3.select(".histogram").append("svg")
                                .attr("width", svgWidth + svgMargin.left + svgMargin.right)
                                .attr("height", svgHeight + svgMargin.top + svgMargin.bottom)
                                .append("g")
                                .attr("transform","translate(" + svgMargin.left + "," + svgMargin.top + ")");

        zoomOutButton = svgContainer.append("g")
                                .attr("class", "zoomOutButton")
                                .attr("transform", "translate(0, -" + buttonSize + ")")
                                .on("mousedown", function() 
                                {
                                    svgContainer.selectAll(".bar").remove();
                                    svgContainer.selectAll(".barText").remove()
                                    svgContainer.select(".xAxis").remove()
                                    svgContainer.select(".yAxis").remove()
                                    
                                    return self.createHistogram() 
                                })

        zoomOutButton.append("rect")
                        .attr("width", buttonSize)
                        .attr("height", buttonSize);
        
        zoomOutButton.append("text")
                        .attr("x", 25)
                        .attr("y", 46)
                        .text("-")
                        .attr("text-anchor","middle");
        
    }


    var getYDomain = function(data)
    {
        console.log("DOMAIN")
        console.log(data)
        var maxDomain = 0;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].AllVehicles.length > maxDomain)
                maxDomain = data[i].AllVehicles.length;
        }

        console.log(maxDomain)
        return maxDomain;
    }

    self.createHistogram = function ()
    {
        console.log("Creating Histogram...");

        var numBins = binData.length - 1;

        var x = d3.scaleLinear()
                    .domain([0, numBins])
                    .range([0, svgWidth]);

        var y = d3.scaleLinear()
                    .domain([0, getYDomain(binData)]) // TODO: CHANGE
                    .range([0, svgHeight]);

        var z = d3.scaleOrdinal()
                    .domain(["1", "2", "3", "4", "5", "6", "2P"])
                    .range(["66c2a5", "fc8d62", "8da0cb", "e78ac3", "a6d854", "ffd92f", "e5c494"])


        var xAxisScale = d3.scaleBand()
                            .domain(["0 - 30 Min", "30 Min+ - 1 Day", " 1 Day+ - 1 Week", "1 Week+ - 1 Month", "1 Month+ - End"]) // TODO: CHANGE
                            .rangeRound([0, svgWidth]);

        var yAxisScale = d3.scaleLinear()
                            .domain([0,  getYDomain(binData)]) // TODO: CHANGE
                            .range([svgHeight, 0]);
	    
                
        var xAxis = d3.axisBottom(xAxisScale)
        var yAxis = d3.axisLeft(yAxisScale);

        svgContainer.selectAll(".bar")
                    .data(binData)
                    .enter()
                    .append("g")
                    .attr("class", "barGroup")
                    .each(function(d)
                    {                        
                        console.log(d);
                    })
                    .append("rect")
                    .attr("transform", "translate(4, 0)")
                    .attr("class", "bar")
                    .attr("width", (svgWidth / numBins) - 2)
                    .attr("height", function(d, i) { return y(binData[i].AllVehicles.length) })
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) - 2})
                    .attr("y", function(d, i) { return svgHeight - y(binData[i].AllVehicles.length)})
                    .attr("fill", "steelblue")
                    .on("mousedown", function(d, i) 
                    {
                        self.zoomHistogram(d, i);
                    })
                    // .append("text")
                    // .attr("x", function(d, i) { return i * (svgWidth / numBins) - 2})
                    // .attr("y", function(d, i) { return svgHeight - y(binData[i].length) - 20})
                    // .text(function(d) { return d.length})
                    // .attr("fill", "white")
                    // .attr("font-family", "sans-serif")
                    // .attr("font-size", "20px")

        svgContainer.selectAll(".barGroup")
                    .data(binData)
                    .append("text")
                    .attr("class", "barText")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2) - 10})
                    .attr("y", function(d, i) { return svgHeight - y(binData[i].AllVehicles.length) - 10})
                    .text(function(d) { return d.length})
                    .attr("font-size", "20px")
                    .attr("fill", "white")
                    .on("mousedown", function(d, i) 
                    {
                        self.zoomHistogram(d, i);
                    })


        svgContainer.append("g")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(0," + svgHeight + ")")
                    .call(xAxis);

        svgContainer.append("g")
                    .attr("class", "yAxis")
                    .call(yAxis);
    }

    self.zoomHistogram = function(d, binNum)
    {
        console.log(binNum)

        var xAxisScale = d3.scaleBand()
                            .rangeRound([0, svgWidth]);
        var zoomedBins = [];
        // < 30 min bin - Split into 30, 1 min bins
        if (binNum == 0)
        {
            for (var i = 1; i <= 30; i++)
            {
                var newBin = [];
                for (var j = 0; j < binData[binNum].AllVehicles.length; j++)
                {
                    if (binData[binNum].AllVehicles[j].TimeSpent >= (i - 1) * 60 && binData[binNum].AllVehicles[j].TimeSpent < i * 60) // 60 Seconds in 1 Min
                        newBin.push(binData[binNum].AllVehicles[j])
                }
                zoomedBins.push(newBin)
            }

            xAxisScale.domain(["< 1", "< 2", "< 3", "< 4", "< 5", "< 6", "< 7", "< 8", "< 9", "< 10", "< 11", "< 12", "< 13", "< 14",  "< 15",
                               "< 16", "< 17", "< 18", "< 19", "< 20", "< 21", "< 22", "< 23", "< 24", "< 25", "< 26", "< 27", "< 28", "< 29", "< 30"])

        }
        else if (binNum == 1)
        {
            // < 1 day bin - Split into 24, 1 hour bins
            for (var i = 1; i <= 24; i++)
            {
                var newBin = [];
                for (var j = 0; j < binData[binNum].AllVehicles.length; j++)
                {
                    if (binData[binNum].AllVehicles[j].TimeSpent > 1800 && binData[binNum].AllVehicles[j].TimeSpent >= ((i - 1) * 3600) && binData[binNum].AllVehicles[j].TimeSpent < (i * 3600)) // 3600 Seconds in 1 Hour
                        newBin.push(binData[binNum].AllVehicles[j])
                }
                zoomedBins.push(newBin)
            }

            xAxisScale.domain(["< 1", "< 2", "< 3", "< 4", "< 5", "< 6", "< 7", "< 8", "< 9", "< 10", "< 11", "< 12", "< 13", "< 14",  "< 15",
                               "< 16", "< 17", "< 18", "< 19", "< 20", "< 21", "< 22", "< 23", "< 24"])
        }
        else if (binNum == 2)
        {
            // < 1 week bin - Split into 6, 1 day bins
            for (var i = 2; i <= 7; i++)
            {
                var newBin = [];
                for (var j = 0; j < binData[binNum].AllVehicles.length; j++)
                {
                    if (binData[binNum].AllVehicles[j].TimeSpent > 86400 && binData[binNum].AllVehicles[j].TimeSpent >= ((i - 1) * 86400) && binData[binNum].AllVehicles[j].TimeSpent < (i * 86400)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum].AllVehicles[j])
                }
                zoomedBins.push(newBin)
            }

            xAxisScale.domain(["< 2", "< 3", "< 4", "< 5", "< 6", "< 7"])
        }
        else if (binNum == 3)
        {
            // 1 Week+ - 1 Month+ - Split into 1 month bins
            for (var i = 2; i <= 4; i++)
            {
                var newBin = [];
                for (var j = 0; j < binData[binNum].AllVehicles.length; j++)
                {
                    if (binData[binNum].AllVehicles[j].TimeSpent > 604800 && binData[binNum].AllVehicles[j].TimeSpent >= ((i - 1) * 604800) && binData[binNum].AllVehicles[j].TimeSpent < (i * 604800)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum].AllVehicles[j])
                }
                zoomedBins.push(newBin)
            }

            xAxisScale.domain(["< 1", "< 2", "< 3", "< 4"])
        }
        else if (binNum == 4)
        {
            for (var i = 2; i <= 12; i++)
            {
                var newBin = [];
                for (var j = 0; j < binData[binNum].AllVehicles.length; j++)
                {
                    if (binData[binNum].AllVehicles[j].TimeSpent > 2628000 && binData[binNum].AllVehicles[j].TimeSpent >= ((i - 1) * 2628000) && binData[binNum].AllVehicles[j].TimeSpent < (i * 2628000)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum].AllVehicles[j])
                }
                zoomedBins.push(newBin)
            }

            xAxisScale.domain(["< 1", "< 2", "< 3", "< 4", "< 5", "< 6", "< 7", "< 8", "< 9", "< 10", "< 11", "< 12"])
        }

        var numBins = zoomedBins.length;

        var x = d3.scaleLinear()
                    .domain([0, numBins])
                    .range([0, svgWidth]);

        var y = d3.scaleLinear()
                    .domain([0, getYDomain(zoomedBins)]) // TODO: CHANGE
                    .range([0, svgHeight]);

        //var z = d3.scaleOrdinal(d3.schemeCategory20);


        var yAxisScale = d3.scaleLinear()
                            .domain([0, getYDomain(zoomedBins)]) // TODO: CHANGE
                            .range([svgHeight, 0]);
	    
                
        var xAxis = d3.axisBottom(xAxisScale)
        var yAxis = d3.axisLeft(yAxisScale);

        svgContainer.selectAll(".bar").remove();
        svgContainer.selectAll(".barText").remove();
        svgContainer.select(".xAxis").remove();
        svgContainer.select(".yAxis").remove();

        svgContainer.selectAll(".bar")
                    .data(zoomedBins)
                    .enter()
                    .append("rect")
                    //.attr("transform", "translate(4, 0)")
                    .attr("class", "bar")
                    .attr("width", (svgWidth / numBins) - 2)
                    .attr("height", function(d, i) { return y(zoomedBins[i].length) })
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) })
                    .attr("y", function(d, i) { return svgHeight - y(zoomedBins[i].length)})
                    .attr("fill", "steelblue")
                    .on("mousedown", function(d) { console.log(d)} )


        svgContainer.append("g")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(0," + svgHeight + ")")
                    .call(xAxis)
                    // .selectAll("text")
                    //     .attr("transform", "rotate(90)")
                    //     .attr("dy", ".15em")
                    //     .attr("dx", ".8em")

        svgContainer.append("g")
                    .attr("class", "yAxis")
                    .call(yAxis);
    }

    //
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createHistogram: function(vData)
        {
            vehicleData = vData;

            self.populateBins();
            self.createSVGs();
            self.createHistogram();
        },
    };

    return publiclyAvailable;
}