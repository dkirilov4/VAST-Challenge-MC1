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
            .attr("transform", "translate(0, -1000)")
            .append("g")
    }

    self.createNodeMap = function()
    {
        var nodeMap = svg.append("g")
            .attr("class", "nodeMap")
            .selectAll(".cell")
            .data(nodeData.nodes)
            .enter()
            .append("circle")
            .attr("class", "cell")
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
                        return ("Entries: " + numReadings);
                    }

                }
            });
    }

    function handleMouseDown(d) 
    {
        for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++)
        {
            if (d.id == dailyData[sliderValue].SensorData[i].Gate)
            {
                console.log(dailyData[sliderValue].SensorData[i].CarTypes);
            }
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

        // var svgContainer = d3.select(".bargraph")
        //     .data(carTypeCounts)
        //     .enter()
        //     .append("text")
        //     .attr("class", "value")
        //     .attr("x", function(d) { return d * 20})
        //     .attr("y", function(d, i) 
        //             { 
        //                 if (i == 0)
        //                     return 2;
        //                 return (i * (barHeight + 2) + 2);
        //             })
        //     .text("ASDASDASD")

    

    }



    var svg;
    var sliderValue = 0;
    document.getElementById("rangeslider").addEventListener("input", onSliderMove, false);
    function onSliderMove(e) {
        var target = (e.target) ? e.target : e.srcElement;

        sliderValue = parseFloat(target.value);

        svg.selectAll(".cell").remove().exit();
        var nodeMap = svg.append("g")
            .attr("class", "nodeMap")
            .selectAll(".cell")
            .data(nodeData.nodes)
            .enter()
            .append("circle")
            .attr("class", "cell")
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
                        return ("Entries: " + numReadings);
                    }

                }
            });
    }

    //
    /* Publicly Available Functions: */
    //
    var publiclyAvailable = 
    {
        createNodeMap: function(rData, dData, gNames, gData)
        {
            rawData = rData;
            dailyData = dData;
            gateNames = gNames;
            gateData = gData;

            nodeData = {
            "nodes": [
                {"id": "entrance0", "x": 193, "y": 33},
                {"id": "entrance1", "x": 57, "y": 195},
                {"id": "entrance2", "x": 558, "y": 258},
                {"id": "entrance3", "x": 353, "y": 499},
                {"id": "entrance4", "x": 429, "y": 551},
                {"id": "general-gate0", "x": 339, "y": 17},
                {"id": "general-gate1", "x": 198, "y": 69},
                {"id": "general-gate2", "x": 321, "y": 91},
                {"id": "general-gate3", "x": 566, "y": 161},
                {"id": "general-gate4", "x": 214, "y": 292},
                {"id": "general-gate5", "x": 381, "y": 328},
                {"id": "general-gate6", "x": 415, "y": 410},
                {"id": "general-gate7", "x": 202, "y": 431},
                {"id": "ranger-stop0", "x": 272, "y": 43},
                {"id": "ranger-stop1", "x": 64, "y": 69},
                {"id": "ranger-stop2", "x": 248, "y": 96},
                {"id": "ranger-stop3", "x": 453, "y": 132},
                {"id": "ranger-stop4", "x": 60, "y": 284},
                {"id": "ranger-stop5", "x": 462, "y": 352},
                {"id": "ranger-stop6", "x": 373, "y": 443},
                {"id": "ranger-stop7", "x": 306, "y": 445},
                {"id": "camping0", "x": 163, "y": 120},
                {"id": "camping1", "x": 396, "y": 147},
                {"id": "camping2", "x": 137, "y": 186},
                {"id": "camping3", "x": 143, "y": 204},
                {"id": "camping4", "x": 151, "y": 266},
                {"id": "camping5", "x": 68, "y": 360},
                {"id": "camping6", "x": 457, "y": 530},
                {"id": "camping7", "x": 553, "y": 433},
                {"id": "camping8", "x": 560, "y": 142},
                {"id": "gate0", "x": 195, "y": 93},
                {"id": "gate1", "x": 180, "y": 129},
                {"id": "gate2", "x": 91, "y": 157},
                {"id": "gate3", "x": 455, "y": 178},
                {"id": "gate4", "x": 502, "y": 340},
                {"id": "gate5", "x": 400, "y": 435},
                {"id": "gate6", "x": 356, "y": 453},
                {"id": "gate7", "x": 298, "y": 479},
                {"id": "gate8", "x": 423, "y": 541},
                {"id": "ranger-base", "x": 394, "y": 525}
            ]
            }

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