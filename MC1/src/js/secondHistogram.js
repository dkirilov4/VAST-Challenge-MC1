"use strict";

var App = App || {};

var GateHistogram = function()
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

	var vehicleData = [];

    var binData = {};

    // SVG Properties
    var svgContainer;
    var svgMargin = { top: 100, left: 50, bottom: 50, right: 200 };
        
    var svgWidth = 960 - svgMargin.left - svgMargin.right;
    var svgHeight = 500 - svgMargin.top - svgMargin.bottom;

    // Zoom Out Button Properties

    //
    /* Histogram */
    //
    self.populateBins = function()
    {
        for (var i = 0; i < 33; i++)
        {
            if (!binData[i.toString()])
                binData[i.toString()] = 0;
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

            if (!binData[numEntrances.toString()])
                binData[numEntrances.toString()] = 0;

            binData[numEntrances.toString()]++;
        }

        console.log(binData)

    }

    self.createSVGs = function()
    {
        svgContainer = d3.select(".histogram").append("svg")
                                .attr("width", svgWidth + svgMargin.left + svgMargin.right)
                                .attr("height", svgHeight + svgMargin.top + svgMargin.bottom)
                                .append("g")
                                .attr("transform","translate(" + svgMargin.left + "," + svgMargin.top + ")");
    }

    self.createHistogram = function ()
    {
        console.log("Creating Second Histogram...");

        var numBins = 33;

        var x = d3.scaleBand()
                    .domain([0, 32]) // TODO: CHANGE
                    .rangeRound([0, svgWidth]);

        var y = d3.scaleLinear()
                    .domain([18000,  0]) // TODO: CHANGE
                    .range([svgHeight, 0]);

        svgContainer.selectAll(".bar")
                    .data(Object.keys(binData))
                    .enter()
                    .append("g")
                    .attr("class", "barGroup")
                    .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2) - 10})
                    .attr("y", function(d, i) { return svgHeight - y(binData[d]) })
                    .attr("width", (svgWidth / numBins) - 2)
                    .attr("height", function(d) { return y(binData[d])} )
                    .attr("fill", "steelblue")

        svgContainer.selectAll(".barGroup")
                    .data(Object.keys(binData))
                    .append("text")
                    .text(function(d) 
                    { 
                        if (binData[d] == 0) 
                            return "";
                        return binData[d];
                    })
                    .attr("class", "barText")
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) + ((svgWidth / numBins) / 2) - 10})
                    .attr("y", function(d, i) { return svgHeight - y(binData[d]) })
                    .attr("font-size", "10px")
                    .attr("fill", "white")
                    .attr("text-anchor", "middle")
                    .attr("dx", svgWidth / numBins / 2)
                    .attr("dy", -10)

        var xAxisScale = d3.scaleLinear()
                            .domain([0, 33]) // TODO: CHANGE
                            .rangeRound([0, svgWidth]);

        var yAxisScale = d3.scaleLinear()
                            .domain([0,  18000]) // TODO: CHANGE
                            .range([svgHeight, 0]);
                    

        var xAxis = d3.axisBottom(xAxisScale).ticks(33)
        var yAxis = d3.axisLeft(yAxisScale);

        svgContainer.append("g")
                    .attr("class", "xAxis")
                    .attr("transform", "translate(0," + svgHeight + ")")
                    .call(xAxis);

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