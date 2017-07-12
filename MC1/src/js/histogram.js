"use strict";

var App = App || {};

var Histogram = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

	var vehicleData = [];

    var lessThanHalfHour = [];
    var lessThanHour = []; // 0 - 3600
    var lessThanDay  = []; // 0 - 86400
    var lessThanWeek = []; // 0 - 604800
    var lessThanMonth = []; // 0 - 2628000
    var lessThanHalfYear = []; // 0 - 15770000
    var lessThanYear = []; // 31540000

    var binData = [];
    var gateBinData = [];

    // SVG Properties
    var svgContainer;
    var svgMargin = { top: 100, left: 50, bottom: 50, right: 200 };
        
    var svgWidth = 720 - svgMargin.left - svgMargin.right;
    var svgHeight = 405 - svgMargin.top - svgMargin.bottom;

    // Zoom Out Button Properties
    var legend;
    var legendText;
    var zoomOutButton;
    var buttonSize = 50;

    //
    /* Histogram */
    //
    self.populateBins = function()
    {
        for (var carID in vehicleData)
        {
            if (vehicleData[carID].TimeSpent < 1800)
                lessThanHalfHour.push(vehicleData[carID])
            // else if (vehicleData[carID].TimeSpent < 3600)
            //     lessThanHour.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 86400)
                lessThanDay.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 604800)
                lessThanWeek.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 2628000)
                lessThanMonth.push(vehicleData[carID])
            else
                lessThanYear.push(vehicleData[carID])
        }

        binData.push(lessThanHalfHour)
        //binData.push(lessThanHour);
        binData.push(lessThanDay);
        binData.push(lessThanWeek);
        binData.push(lessThanMonth);
        binData.push(lessThanYear);
    }

    self.populateGateBins = function()
    {
        for (var i = 0; i < 33; i++)
        {
            if (!gateBinData[i.toString()])
                gateBinData[i.toString()] = 0;
        }
        
        for (var carID in vehicleData)
        {
            // console.log(vehicleData[carID].Locations)
            var numEntrances = 0;
            for (var i = 0; i < vehicleData[carID].Locations.length; i++)
            {
                if (vehicleData[carID].Locations[i].GateName.includes("entrance"))
                    numEntrances++;
            }

            if (!gateBinData[numEntrances.toString()])
                gateBinData[numEntrances.toString()] = 0;

            gateBinData[numEntrances.toString()]++;
        }
    }

    self.createSVGs = function()
    {
        svgContainer = d3.select(".histogramDiv").append("svg")
                                .attr("width", svgWidth + svgMargin.left + svgMargin.right)
                                .attr("height", svgHeight + svgMargin.top + svgMargin.bottom)
                                .append("g")
                                .attr("transform","translate(" + svgMargin.left + "," + svgMargin.top + ")");

        zoomOutButton = svgContainer.append("g")
                                .attr("class", "zoomOutButton")
                                .attr("transform", "translate(0, -" + (buttonSize + buttonSize / 2) + ")")
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
        var maxDomain = 0;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].length > maxDomain)
                maxDomain = data[i].length;
        }

        console.log(maxDomain)
        return maxDomain;
    }

    self.createHistogram = function ()
    {
        console.log("Creating Histogram...");

        var numBins = binData.length;

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
                    .each(function(d, column)
                    {
                        // var numType1  = 0;
                        // var numType2  = 0;
                        // var numType3  = 0;
                        // var numType4  = 0;
                        // var numType5  = 0;
                        // var numType6  = 0;
                        // var numType2P = 0;
                        let counts = {};

                        for (var i = 0; i < d.length; i++)
                        {
                            let type = d[i].CarType.toString();
                            // console.log(type)
                            if (typeof counts[type] !== "number"){
                                counts[type] = 1;
                            }else{
                                counts[type] += 1;
                            }
                            
                        }
                        
                        // console.log(counts)
                        // console.log(Object.keys(counts).length)

                        var yOffset = 0;
                        for (var typeCount in counts)
                        {
                            d3.select(this).append("rect")
                                            .attr("class", "bar")
                                            .attr("width", (svgWidth / numBins) - 2)
                                            .attr("height", function(d, i) 
                                            { 
                                                //console.log("HEIGHT: " + y(counts[typeCount]));
                                                return y(counts[typeCount]) 
                                            }) // Different
                                            .attr("x", function(d) { return column * (svgWidth / numBins)})
                                            .attr("y", function(d, i) 
                                            { 
                                                var tempOffset = yOffset;
                                                yOffset += y(counts[typeCount]);

                                                //console.log("OFFSET: " + tempOffset)
                                                //console.log("Y: " + y(counts[typeCount]));
                                                return (svgHeight - y(counts[typeCount]) - tempOffset)
                                            }) // Different
                                            .attr("fill", function(d) { return "#" + z(typeCount.toString()) })
                                            .on("mousedown", function(d) 
                                            {
                                                self.zoomHistogram(d, column);
                                            })
                        }
                        //console.log("Bin Done")
                        

                    })
                    // .append("rect")
                    // .attr("transform", "translate(4, 0)")
                    // .attr("class", "bar")
                    // .attr("width", (svgWidth / numBins) - 2)
                    // .attr("height", function(d, i) { return y(binData[i].length) })
                    // .attr("x", function(d, i) { return i * (svgWidth / numBins) - 2})
                    // .attr("y", function(d, i) { return svgHeight - y(binData[i].length)})
                    // .attr("fill", "steelblue")
                    // .on("mousedown", function(d, i) 
                    // {
                    //     self.zoomHistogram(d, i);
                    // })

        svgContainer.selectAll(".barGroup")
                    .data(binData)
                    .append("text")
                    .attr("class", "barText")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2)})
                    .attr("y", function(d, i) { return svgHeight - y(binData[i].length) - 10})
                    .attr("text-anchor", "middle")
                    // .attr("dx", svgWidth / numBins / 2)
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
                for (var j = 0; j < binData[binNum].length; j++)
                {
                    if (binData[binNum][j].TimeSpent >= (i - 1) * 60 && binData[binNum][j].TimeSpent < i * 60) // 60 Seconds in 1 Min
                        newBin.push(binData[binNum][j])
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
                for (var j = 0; j < binData[binNum].length; j++)
                {
                    if (binData[binNum][j].TimeSpent > 1800 && binData[binNum][j].TimeSpent >= ((i - 1) * 3600) && binData[binNum][j].TimeSpent < (i * 3600)) // 3600 Seconds in 1 Hour
                        newBin.push(binData[binNum][j])
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
                for (var j = 0; j < binData[binNum].length; j++)
                {
                    if (binData[binNum][j].TimeSpent > 86400 && binData[binNum][j].TimeSpent >= ((i - 1) * 86400) && binData[binNum][j].TimeSpent < (i * 86400)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum][j])
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
                for (var j = 0; j < binData[binNum].length; j++)
                {
                    if (binData[binNum][j].TimeSpent > 604800 && binData[binNum][j].TimeSpent >= ((i - 1) * 604800) && binData[binNum][j].TimeSpent < (i * 604800)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum][j])
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
                for (var j = 0; j < binData[binNum].length; j++)
                {
                    if (binData[binNum][j].TimeSpent > 2628000 && binData[binNum][j].TimeSpent >= ((i - 1) * 2628000) && binData[binNum][j].TimeSpent < (i * 2628000)) // 86400 Seconds in 1 Hour
                        newBin.push(binData[binNum][j])
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
        
        var z = d3.scaleOrdinal()
                    .domain(["1", "2", "3", "4", "5", "6", "2P"])
                    .range(["66c2a5", "fc8d62", "8da0cb", "e78ac3", "a6d854", "ffd92f", "e5c494"])

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
                    .append("g")
                    .attr("class", "barGroup")
                    .each(function(d, column)
                    {
                        //console.log(d)
                        let counts = {};

                        for (var i = 0; i < d.length; i++)
                        {
                            let type = d[i].CarType.toString();
                            // console.log(type)
                            if (typeof counts[type] !== "number"){
                                counts[type] = 1;
                            }else{
                                counts[type] += 1;
                            }
                            
                        }
                        
                        // console.log(counts)
                        // console.log(Object.keys(counts).length)

                        var yOffset = 0;
                        for (var typeCount in counts)
                        {
                            d3.select(this).append("rect")
                                            .attr("class", "bar")
                                            .attr("width", (svgWidth / numBins) - 2)
                                            .attr("height", function(d, i) 
                                            { 
                                                //console.log("HEIGHT: " + y(counts[typeCount]));
                                                return y(counts[typeCount]) 
                                            }) // Different
                                            .attr("x", function(d) { return column * (svgWidth / numBins)})
                                            .attr("y", function(d, i) 
                                            { 
                                                var tempOffset = yOffset;
                                                yOffset += y(counts[typeCount]);

                                                //console.log("OFFSET: " + tempOffset)
                                                //console.log("Y: " + y(counts[typeCount]));
                                                return (svgHeight - y(counts[typeCount]) - tempOffset)
                                            }) // Different
                                            .attr("fill", function(d) { return "#" + z(typeCount.toString()) })
                        }
                        //console.log("Bin Done")
                        

                    })
                    .on("mousedown", function(d){
                        //console.log(d)
                    })
        // svgContainer.selectAll(".bar")
        //             .data(zoomedBins)
        //             .enter()
        //             .append("rect")
        //             //.attr("transform", "translate(4, 0)")
        //             .attr("class", "bar")
        //             .attr("width", (svgWidth / numBins) - 2)
        //             .attr("height", function(d, i) { return y(zoomedBins[i].length) })
        //             .attr("x", function(d, i) { return i * (svgWidth / numBins) })
        //             .attr("y", function(d, i) { return svgHeight - y(zoomedBins[i].length)})
        //             .attr("fill", "steelblue")
        //             .on("mousedown", function(d) { console.log(d)} )
        console.log(zoomedBins)
        svgContainer.selectAll(".barGroup")
                    .data(zoomedBins)
                    .append("text")
                    .attr("class", "barText")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2)})
                    .attr("y", function(d, i) { return svgHeight - y(zoomedBins[i].length) - 10})
                    .attr("text-anchor", "middle")
                    // .attr("dx", svgWidth / numBins / 2)
                    .text(function(d) { return d.length})
                    .attr("font-size", "10px")
                    .attr("fill", "white")


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

    self.createGateHistogram = function ()
    {
        console.log("Creating Second Histogram...");

        var numBins = 33;

        var x = d3.scaleBand()
                    .domain([0, 32]) // TODO: CHANGE
                    .rangeRound([0, svgWidth]);

        var y = d3.scaleLinear()
                    .domain([18000,  0]) // TODO: CHANGE
                    .range([svgHeight, 0]);

        console.log(gateBinData)
        svgContainer.selectAll(".bar")
                    .data(Object.keys(gateBinData))
                    .enter()
                    .append("g")
                    .attr("class", "barGroup")
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2)})
                    .attr("y", function(d, i) { return svgHeight - y(gateBinData[d]) })
                    .attr("width", (svgWidth / numBins))
                    .attr("height", function(d) { return y(gateBinData[d])} )
                    .attr("fill", "steelblue")

        svgContainer.selectAll(".barGroup")
                    .data(Object.keys(gateBinData))
                    .append("text")
                    .text(function(d) 
                    { 
                        if (gateBinData[d] == 0) 
                            return "";
                        return gateBinData[d];
                    })
                    .attr("class", "barText")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2)})
                    .attr("y", function(d, i) { return svgHeight - y(gateBinData[d]) })
                    .attr("font-size", "10px")
                    .attr("fill", "white")
                    .attr("text-anchor", "middle")
                    .attr("dx", svgWidth / numBins / 2)
                    .attr("dy", -10)

        var xAxisScale = d3.scaleLinear()
                            .domain([-1, 32]) // TODO: CHANGE
                            .rangeRound([0, svgWidth]);

        var yAxisScale = d3.scaleLinear()
                            .domain([0,  18000]) // TODO: CHANGE
                            .range([svgHeight, 0]);
                    

        var xAxis = d3.axisBottom(xAxisScale).ticks(32)
        var yAxis = d3.axisLeft(yAxisScale);

        svgContainer.append("g")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(0," + svgHeight + ")")
                    .call(xAxis);

        svgContainer.append("g")
                    .attr("class", "yAxis")
                    .call(yAxis);
    }

    self.createLegend = function()
    {
        var colorScale = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494"];
        var carTypes   = ["2 Axle Car / Motorcycle", "2 Axle Truck", "3 Axle Truck", "4+ Axle Truck", "2 Axle Bus", "3 Axle Bus", "Park Preserve Vehicle"]

        var legendBinSize = 15;

        legend = svgContainer.selectAll("legendBin").data(colorScale).enter()
                    .append("g")
                    .attr("class", "legendBinGroup")
                    .append("rect")
                    .attr("class", "legendBin")
                    .attr("x", svgWidth)
                    .attr("y", function(d, i) { return svgHeight/4 - (i * legendBinSize)})
                    .attr("width", legendBinSize)
                    .attr("height", legendBinSize)
                    .attr("fill", function(d) { return d} )

        legendText = svgContainer.selectAll(".legendBinGroup")
                    .data(carTypes)
                    .append("text")
                    .text(function(d) { return d})
                    .attr("x", svgWidth + legendBinSize + 4)
                    .attr("y", function(d, i) { return svgHeight/4 - (i * legendBinSize) + legendBinSize / 2 + 6})
                    .attr("fill", "white")

        
    }

    document.getElementById("gateEntriesCheckbox").addEventListener("change", filterHistograms, false);
    function filterHistograms()
    {
        var checked = document.getElementById("gateEntriesCheckbox").checked;

        if (checked)
        {
            svgContainer.selectAll(".bar").remove();
            svgContainer.selectAll(".barText").remove()
            svgContainer.selectAll(".barGroup").remove();
            svgContainer.selectAll(".legendBinGroup").remove();
            svgContainer.select(".xAxis").remove()
            svgContainer.select(".yAxis").remove()
            zoomOutButton.remove();
            legend.remove();
            legendText.remove();

            self.createGateHistogram();
        }
        else
        {
            svgContainer.selectAll(".barGroup").remove();
            svgContainer.select(".xAxis").remove()
            svgContainer.select(".yAxis").remove()

            self.createHistogram();
        }
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
            self.populateGateBins();
            self.createSVGs();
            self.createHistogram();
            self.createLegend();
        },
    };

    return publiclyAvailable;
}