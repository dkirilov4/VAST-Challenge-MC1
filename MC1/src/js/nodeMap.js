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


        svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(0, -1000)")
            .append("g")
    }

    self.createNodeMap = function()
    {
        var nodeMap = svg.append("g")
            .attr("class", "nodeMap")
            .attr("transform", "translate(0, -20)")
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
    var height = 600;
    function handleMouseOver(d)
    {
        var carTypes = ["1", "2", "3", "4", "5", "6", "2P"];

        d3.select(".bargraph").selectAll(".bar")
                .data(nodeData.nodes)
                .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return 5;})
                    .attr("y", function(d) 
                    { 
                        // TODO
                    })
                    .attr("width", function(d)
                    {
                        for (var i = 0; i < dailyData[sliderValue].SensorData.length; i++)
                        {
                            if (d.id == dailyData[sliderValue].SensorData[i].Gate)
                            {
                                return dailyData[sliderValue].SensorData[i].CarTypes.length;

                            }
                        }
                    })
                    .attr("height", 13)
                    .attr("fill", "steelblue")
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
        createNodeMap: function(rData, dData, gData)
        {
            rawData = rData;
            dailyData = dData;
            gateData = gData;

            nodeData = {
            "nodes": [
                {"id": "entrance0", "x": 193, "y": 43},
                {"id": "entrance1", "x": 57, "y": 205},
                {"id": "entrance2", "x": 558, "y": 268},
                {"id": "entrance3", "x": 353, "y": 509},
                {"id": "entrance4", "x": 429, "y": 561},
                {"id": "general-gate0", "x": 339, "y": 27},
                {"id": "general-gate1", "x": 198, "y": 79},
                {"id": "general-gate2", "x": 321, "y": 101},
                {"id": "general-gate3", "x": 566, "y": 171},
                {"id": "general-gate4", "x": 214, "y": 302},
                {"id": "general-gate5", "x": 381, "y": 338},
                {"id": "general-gate6", "x": 415, "y": 420},
                {"id": "general-gate7", "x": 202, "y": 441},
                {"id": "ranger-stop0", "x": 272, "y": 53},
                {"id": "ranger-stop1", "x": 64, "y": 79},
                {"id": "ranger-stop2", "x": 248, "y": 106},
                {"id": "ranger-stop3", "x": 453, "y": 142},
                {"id": "ranger-stop4", "x": 60, "y": 294},
                {"id": "ranger-stop5", "x": 462, "y": 362},
                {"id": "ranger-stop6", "x": 373, "y": 453},
                {"id": "ranger-stop7", "x": 306, "y": 455},
                {"id": "camping0", "x": 163, "y": 130},
                {"id": "camping1", "x": 396, "y": 157},
                {"id": "camping2", "x": 137, "y": 196},
                {"id": "camping3", "x": 143, "y": 214},
                {"id": "camping4", "x": 151, "y": 276},
                {"id": "camping5", "x": 68, "y": 370},
                {"id": "camping6", "x": 457, "y": 540},
                {"id": "camping7", "x": 553, "y": 443},
                {"id": "camping8", "x": 560, "y": 152},
                {"id": "gate0", "x": 195, "y": 103},
                {"id": "gate1", "x": 180, "y": 139},
                {"id": "gate2", "x": 91, "y": 167},
                {"id": "gate3", "x": 455, "y": 188},
                {"id": "gate4", "x": 502, "y": 350},
                {"id": "gate5", "x": 400, "y": 445},
                {"id": "gate6", "x": 356, "y": 463},
                {"id": "gate7", "x": 298, "y": 489},
                {"id": "gate8", "x": 423, "y": 551},
                {"id": "ranger-base", "x": 394, "y": 535}
            ]
            }

            self.createCanvas();
            //self.createNodeMap();

            d3.select("body").append("svg")
                .attr("class", "bargraph")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(620, -2000)")
        },
    };

    return publiclyAvailable;

}