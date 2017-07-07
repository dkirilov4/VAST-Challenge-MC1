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


    //
    /* Histogram */
    //
    self.populateBins = function()
    {
        //console.log(vehicleData);

        for (var carID in vehicleData)
        {
            if (vehicleData[carID].TimeSpent < 1800)
                lessThanHalfHour.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 3600)
                lessThanHour.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 86400)
                lessThanDay.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 604800)
                lessThanWeek.push(vehicleData[carID])
            else if (vehicleData[carID].TimeSpent < 2628000)
                lessThanMonth.push(vehicleData[carID])
            else
                lessThanHalfYear.push(vehicleData[carID])
        }

        binData.push(lessThanHalfHour)
        binData.push(lessThanHour);
        binData.push(lessThanDay);
        binData.push(lessThanWeek);
        binData.push(lessThanMonth);
        binData.push(lessThanYear)
    }

    self.createHistogram = function ()
    {
        console.log("Creating Histogram...");

        var svgMargin = { top: 50, left: 50, bottom: 50, right: 75 };
        
        var svgWidth = 960 - svgMargin.left - svgMargin.right;
        var svgHeight = 500 - svgMargin.top - svgMargin.bottom;


        var svgContainer = d3.select("body").append("svg")
                                .attr("width", svgWidth + svgMargin.left + svgMargin.right)
                                .attr("height", svgHeight + svgMargin.top + svgMargin.bottom)
                                .append("g")
                                .attr("transform","translate(" + svgMargin.left + "," + svgMargin.top + ")");

        var numBins = binData.length;

        var x = d3.scaleLinear()
                    .domain([0, numBins])
                    .range([0, svgWidth]);

        var y = d3.scaleLinear()
                    .domain([0, binData[3].length]) // TODO: CHANGE
                    .range([0, svgHeight]);

        var xAxis = d3.axisBottom(x);
	    var yAxis = d3.axisLeft(y);

        svgContainer.selectAll(".bar")
                    .data(binData)
                    .enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("width", (svgWidth / numBins) - 2)
                    .attr("height", function(d, i) { return y(binData[i].length) })
                    .attr("x", function(d, i) { return i * (svgWidth / numBins) - 2})
                    .attr("y", function(d, i) { return svgHeight - y(binData[i].length)})
                    .attr("fill", "steelblue")
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
            self.createHistogram();
        },
    };

    return publiclyAvailable;
}