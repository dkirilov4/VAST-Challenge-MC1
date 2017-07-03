"use strict";

var App = App || {};

var NodeMap = function () 
{
    var self = this;

    //
    /* Global Scope Variables: */
    //

    // Data Containers:
    var rawData = [];       // Format: {Timestamp, CarID, CarType, GateName}

    var dailyData = [];     // Format: {}
    
    var gateNames = [];

    var gateData = [];

    var vehicleData = [];

    var nodeData = [];



    //
    /* Node Map: */
    //

    // Node Map Properties:
    // SVG Properties:
    self.createCanvas = function()
    {
        var canvas = document.querySelector("canvas"),
            context = canvas.getContext("2d"),
            width = canvas.width,
            height = canvas.height;

        var image = new Image;
        image.src = "data/Lekagul Roadways labeled v2.jpg";

        image.onload = loaded;

        function loaded() {
            context.globalAlpha = 0.2;
            context.scale(.621, .621);
            context.drawImage(this, 0, 0);
        }


        svg = d3.select(".nodeMapDiv").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
    }

    self.createNodeMap = function()
    {
        var nodeMap = svg.append("g")
            .attr("class", "nodeMap")
            .selectAll("circle")
            .data(nodeData)
            .enter()
            .append("circle")
            .attr("class", function(d) { return d.id })
            .attr("cx", function (d) {
                return d.x
            })
            .attr("cy", function (d) {
                return d.y
            })
            .attr("fill", function (d) {
                if (d.id.includes("entrance"))
                    return "#4daf4a";
                else if (d.id.includes("general-gate"))
                    return "#377eb8";
                else if (d.id.includes("ranger-stop"))
                    return "#ffff33";
                else if (d.id.includes("camping"))
                    return "#ff7f00";
                else if (d.id.includes("ranger-base"))
                    return "#984ea3";
                else
                    return "#fb8072"
            })
            .attr("r", function (d) {
                for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++) {
                    if (d.id == dailyData[sliderValue].SensorData[i].Gate) {
                        if (dailyData[sliderValue].SensorData[i].NumReadings == 0)
                        {
                            d3.select(this).attr("fill", "grey");
                            return 5;
                        }
                        if (dailyData[sliderValue].SensorData[i].NumReadings < 5) {
                            return 5;
                        } else
                            return dailyData[sliderValue].SensorData[i].NumReadings;
                    }

                }
            })
            .on("mousedown", handleMouseDown)
            .on("mouseover", handleMouseOver)
            .append("title")
            .text(function (d) {
                for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++) {
                    if (d.id == dailyData[sliderValue].SensorData[i].Gate) {
                        var numReadings = dailyData[sliderValue].SensorData[i].NumReadings;
                        return (d.id + "\nEntries: " + numReadings);
                    }

                }
            });
    }

    function handleMouseDown(d) 
    {   
        var carID = "20153203103200-611"
        var locations = [];

        for (var i = 0; i < vehicleData[carID].Locations.length; i++)
        {
            var newLocation = [vehicleData[carID].Locations[i].Points.X, vehicleData[carID].Locations[i].Points.Y];
            locations.push(newLocation);
        }

        var line = d3.line()
            .curve(d3.curveCardinal.tension(0));

        var svg = d3.select(".nodeMapDiv").append("svg")
            .datum(locations)
            .attr("width", 960)
            .attr("height", 800);

        svg.append("path")
            .style("stroke", "#ddd")
            .style("stroke-dasharray", "4,4")
            .attr("d", line);

        svg.append("path")
            .attr("d", line)
            .call(transition);

        function transition(path) 
        {
            path.transition()
                .duration(7500)
                .attrTween("stroke-dasharray", tweenDash)
                .on("end", function() { d3.select(this).call((transition)); });
        }

        function tweenDash() 
        {
            var l = this.getTotalLength(),
                i = d3.interpolateString("0," + l, l + "," + l);
            return function(t) { return i(t); };
        }
    }


    var width = 400;
    var height = 400;
    function handleMouseOver(d)
    {
        // 1  - 2 Axle Car or Motorcycle
        // 2  - 2 Axle Truck
        // 3  - 3 Axle Truck
        // 4  - 4 Axle Truck
        // 5  - 2 Axle Bus
        // 6  - 3 Axle Bus
        // 2P - Park Preserve Vehices 
        var carTypes = ["2 Axle Car or Motorcycle", "2 Axle Truck", "3 Axle Truck", "4 Axle Truck", "2 Axle Bus", "3 Axle Bus", "Park Preserve Vehices"];
        var carTypeCounts = [0, 0, 0, 0, 0, 0, 0];

        for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++)
        {
            if (d.id == dailyData[sliderValue].SensorData[i].Gate)
            {
                for (var j = 0; j < dailyData[sliderValue].SensorData[i].CarTypes.length; j++)
                {
                    if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "1")
                        carTypeCounts[0]++;
                    else if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "2")
                        carTypeCounts[1]++;
                    else if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "3")
                        carTypeCounts[2]++;
                    else if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "4")
                        carTypeCounts[3]++;
                    else if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "5")
                        carTypeCounts[4]++;
                    else if (dailyData[sliderValue].SensorData[i].CarTypes[j] == "6")
                        carTypeCounts[5]++;
                    else
                        carTypeCounts[6]++;
                }
            }
        }

        d3.selectAll(".bar").remove();

        var barHeight = 50;

        var bar = d3.select(".bargraph").selectAll(".bar")
                .data(carTypeCounts)
                .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", 2)
                    .attr("y", function(d, i) 
                    { 
                        if (i == 0)
                            return 2;
                        return (i * (barHeight + 2) + 2);
                    })
                    .attr("height", barHeight)
                    .attr("width", function (d)
                    {
                        return d * 20;
                    })
                    .attr("fill", "steelblue")
                    .append("title")
                        .text(function(d, i)
                        {
                            return (carTypes[i] + ": " + d);
                        });
    }



    var svg;
    var sliderValue = 0;
    document.getElementById("rangeslider").addEventListener("input", onSliderMove, false);
    function onSliderMove(e) {
        var target = (e.target) ? e.target : e.srcElement;

        sliderValue = parseFloat(target.value);

        svg.selectAll("circle").remove().exit();

        var nodeMap = svg.append("g")
            .attr("class", "nodeMap")
            .selectAll("circle")
            .data(nodeData)
            .enter()
            .append("circle")
            .attr("class", function(d) { return d.id })
            .attr("cx", function (d) {
                return d.x
            })
            .attr("cy", function (d) {
                return d.y
            })
            .attr("fill", function (d) {
                if (d.id.includes("entrance"))
                    return "#4daf4a";
                else if (d.id.includes("general-gate"))
                    return "#377eb8";
                else if (d.id.includes("ranger-stop"))
                    return "#ffff33";
                else if (d.id.includes("camping"))
                    return "#ff7f00";
                else if (d.id.includes("ranger-base"))
                    return "#984ea3";
                else
                    return "#fb8072"
            })
            .attr("r", function (d) {
                for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++) {
                    if (d.id == dailyData[sliderValue].SensorData[i].Gate) {
                        if (dailyData[sliderValue].SensorData[i].NumReadings == 0)
                        {
                            d3.select(this).attr("fill", "grey");
                            return 5;
                        }
                        if (dailyData[sliderValue].SensorData[i].NumReadings / 2 < 10) {
                            return 5;
                        } else
                            return dailyData[sliderValue].SensorData[i].NumReadings / 2;
                    }

                }
            })
            .append("title")
            .text(function (d) {
                for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++) {
                    if (d.id == dailyData[sliderValue].SensorData[i].Gate) {
                        var numReadings = dailyData[sliderValue].SensorData[i].NumReadings;
                        return (d.id + "\nEntries: " + numReadings);
                    }

                }
            });
    }

    //
    // nice
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createNodeMap: function(rData, dData, gNames, gData, nData, vData)
        {
            rawData = rData;
            dailyData = dData;
            gateNames = gNames;
            gateData = gData;
            nodeData = nData
            vehicleData = vData;
            
            self.createCanvas();
            self.createNodeMap();

            var x = d3.scaleLinear().range([0, width]);   

            d3.select(".barGraphDiv").append("svg")
                .attr("class", "bargraph")
                .attr("width", width)
                .attr("height", height)
        },
    };

    return publiclyAvailable;

}